import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { prisma } from "#lib/prisma.ts";

export async function GET(req: Request): Promise<Response> {
	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		return authContext;
	}

	const [settings, levels, periods, absenceUnits, subjectCategories, subjects] =
		await Promise.all([
			prisma.schoolSettings.findFirst(),
			prisma.level.findMany({ orderBy: { order: "asc" } }),
			prisma.coursePeriod.findMany({ orderBy: { order: "asc" } }),
			prisma.absenceUnit.findMany({
				orderBy: { label: "asc" },
				include: { periodLinks: true },
			}),
			prisma.subjectCategory.findMany({ orderBy: { order: "asc" } }),
			prisma.subject.findMany({
				orderBy: { label: "asc" },
				include: { category: true },
			}),
		]);

	return Response.json({
		schoolSettings: settings
			? {
					id: settings.id,
					schoolName: settings.schoolName,
				}
			: null,
		levels: levels.map((level) => ({
			id: level.id,
			label: level.label,
			order: level.order,
		})),
		coursePeriods: periods.map((period) => ({
			id: period.id,
			label: period.label,
			startsAt: period.startsAt.toISOString(),
			endsAt: period.endsAt.toISOString(),
			order: period.order,
		})),
		absenceUnits: absenceUnits.map((unit) => ({
			id: unit.id,
			label: unit.label,
			periodIds: unit.periodLinks.map((link) => link.periodId),
		})),
		subjectCategories: subjectCategories.map((category) => ({
			id: category.id,
			label: category.label,
			order: category.order,
		})),
		subjects: subjects.map((subject) => ({
			id: subject.id,
			label: subject.label,
			weight: subject.weight,
			categoryId: subject.categoryId,
			valueType: subject.valueType,
			numericMin: subject.numericMin?.toString() ?? null,
			numericMax: subject.numericMax?.toString() ?? null,
			numericDecimals: subject.numericDecimals,
			literalScale: subject.literalScale,
		})),
	});
}
