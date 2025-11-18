import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { createApiLogger } from "#lib/logging.ts";
import { prisma } from "#lib/prisma.ts";

const ROUTE_SCOPE = "api:admin/config/state";

export async function GET(req: Request): Promise<Response> {
	const logger = createApiLogger(`${ROUTE_SCOPE}#GET`);
	await logger.debug("Incoming request", { method: req.method, url: req.url });

	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		await logger.warn("Rejected access", { status: authContext.status });
		return authContext;
	}

	const scopedLogger = logger.with({ userId: authContext.user.id });

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

	await scopedLogger.info("Fetched admin configuration state", {
		levels: levels.length,
		periods: periods.length,
		absenceUnits: absenceUnits.length,
		subjectCategories: subjectCategories.length,
		subjects: subjects.length,
	});

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
