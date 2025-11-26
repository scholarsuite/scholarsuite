import { prisma } from "#lib/prisma.ts";
import type { Prisma } from "#prisma/client";
import type {
	AdminSchoolYear,
	CreateEvaluationPeriodRequest,
	CreateSchoolYearRequest,
	SchoolYearListResponse,
	SchoolYearStatus,
} from "#types/admin/schoolYear.ts";

const schoolYearInclude = {
	levels: {
		include: {
			level: { select: { label: true, order: true } },
		},
	},
	periods: { orderBy: { startsAt: "asc" } },
	classes: {
		where: { archived: false },
		select: { id: true },
	},
	groups: {
		where: { archived: false },
		select: { id: true },
	},
	_count: { select: { studentYears: true } },
} satisfies Prisma.SchoolYearInclude;

type SchoolYearWithRelations = Prisma.SchoolYearGetPayload<{
	include: typeof schoolYearInclude;
}>;

type SchoolYearLevelWithLevel = Prisma.SchoolYearLevelGetPayload<{
	include: { level: { select: { label: true; order: true } } };
}>;

type AbsenceUnitRecord = { label: string };

type LevelRecord = { id: string; label: string };

function resolveSchoolYearStatus(
	year: SchoolYearWithRelations,
	reference: Date,
): SchoolYearStatus {
	const referenceTime = reference.getTime();
	const startsAt = year.startsAt.getTime();
	const endsAt = year.endsAt.getTime();

	if (referenceTime < startsAt) {
		return "upcoming";
	}
	if (referenceTime > endsAt) {
		return "archived";
	}
	return "active";
}

function mapEvaluationPeriods(
	yearStatus: SchoolYearStatus,
	reference: Date,
	year: SchoolYearWithRelations,
): AdminSchoolYear["evaluationPeriods"] {
	return year.periods.map((period, index) => {
		const status = (() => {
			if (yearStatus === "archived") {
				return "archived" as const;
			}
			if (period.startsAt > reference) {
				return "planned" as const;
			}
			if (period.endsAt < reference) {
				return "locked" as const;
			}
			return "open" as const;
		})();

		return {
			id: period.id,
			label: period.label,
			startsAt: period.startsAt.toISOString(),
			endsAt: period.endsAt.toISOString(),
			order: index + 1,
			status,
		};
	});
}

function mapLevels(levels: SchoolYearWithRelations["levels"]): string[] {
	const enrichedLevels = levels as unknown as SchoolYearLevelWithLevel[];
	return enrichedLevels
		.map((entry) => ({
			label: entry.level?.label ?? "",
			order: entry.level?.order ?? Number.MAX_SAFE_INTEGER,
		}))
		.filter((entry) => entry.label.length > 0)
		.sort((a, b) => a.order - b.order)
		.map((entry) => entry.label);
}

function serializeSchoolYear(
	year: SchoolYearWithRelations,
	absenceUnits: AbsenceUnitRecord[],
	reference = new Date(),
): AdminSchoolYear {
	const status = resolveSchoolYearStatus(year, reference);
	return {
		id: year.id,
		label: year.label,
		startsAt: year.startsAt.toISOString(),
		endsAt: year.endsAt.toISOString(),
		status,
		levels: mapLevels(year.levels),
		absenceUnits: absenceUnits.map((unit) => unit.label),
		studentsCount: year._count.studentYears,
		classesCount: year.classes.length,
		groupsCount: year.groups.length,
		evaluationPeriods: mapEvaluationPeriods(status, reference, year),
		updatedAt: year.updatedAt.toISOString(),
		notes: null,
	};
}

async function fetchAbsenceUnits(): Promise<AbsenceUnitRecord[]> {
	return prisma.absenceUnit.findMany({
		select: { label: true },
		orderBy: { label: "asc" },
	});
}

async function fetchSchoolYearWithRelations(
	schoolYearId: string,
): Promise<SchoolYearWithRelations | null> {
	return prisma.schoolYear.findUnique({
		where: { id: schoolYearId },
		include: schoolYearInclude,
	});
}

export async function listSchoolYears(): Promise<SchoolYearListResponse> {
	const [absenceUnits, schoolYears] = await Promise.all([
		fetchAbsenceUnits(),
		prisma.schoolYear.findMany({
			orderBy: { startsAt: "desc" },
			include: schoolYearInclude,
		}),
	]);

	const reference = new Date();

	return {
		schoolYears: schoolYears.map((year) =>
			serializeSchoolYear(year, absenceUnits, reference),
		),
	};
}

// The result is stable for a day and could benefit from memoization/cache in the future.
export async function getCurrentSchoolYear(
	reference = new Date(),
): Promise<AdminSchoolYear | null> {
	const schoolYear = await prisma.schoolYear.findFirst({
		where: {
			startsAt: { lte: reference },
			endsAt: { gte: reference },
		},
		include: schoolYearInclude,
		orderBy: { startsAt: "desc" },
	});

	if (!schoolYear) {
		return null;
	}

	const absenceUnits = await fetchAbsenceUnits();
	return serializeSchoolYear(schoolYear, absenceUnits, reference);
}

export async function getSchoolYearById(
	schoolYearId: string,
): Promise<AdminSchoolYear | null> {
	const [absenceUnits, schoolYear] = await Promise.all([
		fetchAbsenceUnits(),
		fetchSchoolYearWithRelations(schoolYearId),
	]);

	if (!schoolYear) {
		return null;
	}

	return serializeSchoolYear(schoolYear, absenceUnits);
}

export async function createSchoolYear(
	payload: CreateSchoolYearRequest,
): Promise<AdminSchoolYear> {
	const { label, startsAt, endsAt, levels = [] } = payload;

	const availableLevels = await prisma.level.findMany({
		select: { id: true, label: true },
	});

	const levelById = new Map<string, LevelRecord>();
	const levelByLabel = new Map<string, LevelRecord>();

	for (const level of availableLevels) {
		levelById.set(level.id, level);
		levelByLabel.set(level.label.trim().toLowerCase(), level);
	}

	const selectedLevelIds = new Set<string>();
	for (const reference of levels) {
		if (typeof reference !== "string") {
			continue;
		}
		const trimmed = reference.trim();
		if (!trimmed) {
			continue;
		}
		const matchById = levelById.get(trimmed);
		if (matchById) {
			selectedLevelIds.add(matchById.id);
			continue;
		}
		const matchByLabel = levelByLabel.get(trimmed.toLowerCase());
		if (matchByLabel) {
			selectedLevelIds.add(matchByLabel.id);
		}
	}

	const created = await prisma.schoolYear.create({
		data: {
			label,
			startsAt: new Date(startsAt),
			endsAt: new Date(endsAt),
			levels: {
				create: Array.from(selectedLevelIds).map((levelId) => ({
					level: { connect: { id: levelId } },
				})),
			},
		},
	});

	const [schoolYear, absenceUnits] = await Promise.all([
		fetchSchoolYearWithRelations(created.id),
		fetchAbsenceUnits(),
	]);

	if (!schoolYear) {
		throw new Error("Failed to load created school year");
	}

	return serializeSchoolYear(schoolYear, absenceUnits);
}

export async function addEvaluationPeriod(
	schoolYearId: string,
	payload: CreateEvaluationPeriodRequest,
): Promise<AdminSchoolYear | null> {
	await prisma.evaluationPeriod.create({
		data: {
			label: payload.label,
			startsAt: new Date(payload.startsAt),
			endsAt: new Date(payload.endsAt),
			schoolYear: { connect: { id: schoolYearId } },
		},
	});

	return getSchoolYearById(schoolYearId);
}

export async function removeEvaluationPeriod(
	schoolYearId: string,
	periodId: string,
): Promise<AdminSchoolYear | null> {
	const period = await prisma.evaluationPeriod.findUnique({
		where: { id: periodId },
		select: { schoolYearId: true },
	});

	if (!period || period.schoolYearId !== schoolYearId) {
		return null;
	}

	await prisma.evaluationPeriod.delete({ where: { id: periodId } });

	return getSchoolYearById(schoolYearId);
}
