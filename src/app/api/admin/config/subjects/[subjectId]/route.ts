import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { createApiLogger } from "#lib/logging.ts";
import { prisma } from "#lib/prisma.ts";
import { GRADE_VALUE_TYPE, Prisma } from "#prisma/client";

function parseValueType(value: unknown): GRADE_VALUE_TYPE | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (typeof value !== "string") {
		throw new Error("valueType must be a string");
	}

	const normalized = value.trim().toUpperCase();
	if (!(normalized in GRADE_VALUE_TYPE)) {
		throw new Error("Invalid valueType");
	}

	return GRADE_VALUE_TYPE[normalized as keyof typeof GRADE_VALUE_TYPE];
}

function toDecimalString(
	value: unknown,
	field: string,
): string | null | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (value === null || value === "") {
		return null;
	}

	if (typeof value !== "number" && typeof value !== "string") {
		throw new Error(`${field} must be a number`);
	}

	const num = Number(value);
	if (!Number.isFinite(num)) {
		throw new Error(`${field} must be finite`);
	}

	return num.toString();
}

function ensureLiteralScale(literalScale: unknown): Prisma.InputJsonValue {
	if (!Array.isArray(literalScale) || literalScale.length === 0) {
		throw new Error("literalScale must be a non-empty array");
	}

	for (const entry of literalScale) {
		if (
			!entry ||
			typeof entry !== "object" ||
			typeof (entry as { code?: unknown }).code !== "string" ||
			typeof (entry as { label?: unknown }).label !== "string"
		) {
			throw new Error(
				"Each literalScale entry must have code and label strings",
			);
		}
	}

	return literalScale as Prisma.InputJsonValue;
}

const ROUTE_SCOPE = "api:admin/config/subjects/[subjectId]";

export async function PATCH(
	req: Request,
	context: RouteContext<"/api/admin/config/subjects/[subjectId]">,
): Promise<Response> {
	const logger = createApiLogger(`${ROUTE_SCOPE}#PATCH`);
	await logger.debug("Incoming request", { method: req.method, url: req.url });

	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		await logger.warn("Rejected access", { status: authContext.status });
		return authContext;
	}

	const scopedLogger = logger.with({ userId: authContext.user.id });

	const params = await context.params;
	const subjectId = params.subjectId;
	if (!subjectId) {
		await scopedLogger.warn("Missing subjectId parameter");
		return Response.json({ error: "Missing subjectId" }, { status: 400 });
	}

	let body: Record<string, unknown>;
	try {
		body = await req.json();
	} catch {
		await scopedLogger.warn("Invalid JSON payload received", { subjectId });
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (Object.keys(body).length === 0) {
		await scopedLogger.warn("No fields provided for update", { subjectId });
		return Response.json({ error: "No fields to update" }, { status: 400 });
	}

	const subject = await prisma.subject.findUnique({
		where: { id: subjectId },
	});

	if (!subject) {
		await scopedLogger.warn("Subject not found", { subjectId });
		return Response.json({ error: "Subject not found" }, { status: 404 });
	}

	const data: Prisma.SubjectUpdateInput = {};

	if (body.label !== undefined) {
		if (typeof body.label !== "string" || body.label.trim().length === 0) {
			await scopedLogger.warn("Invalid subject label", { subjectId });
			return Response.json({ error: "Invalid label" }, { status: 400 });
		}
		data.label = body.label.trim();
	}

	if (body.weight !== undefined) {
		if (typeof body.weight !== "number" || !Number.isFinite(body.weight)) {
			await scopedLogger.warn("Invalid subject weight", { subjectId });
			return Response.json({ error: "Invalid weight" }, { status: 400 });
		}
		data.weight = body.weight;
	}

	let effectiveValueType = subject.valueType;
	const newValueType = parseValueType(body.valueType);
	if (newValueType !== undefined) {
		effectiveValueType = newValueType;
		data.valueType = newValueType;
	}

	if (body.categoryId !== undefined) {
		if (body.categoryId === null) {
			data.category = { disconnect: true };
		} else if (typeof body.categoryId === "string" && body.categoryId.trim()) {
			data.category = { connect: { id: body.categoryId.trim() } };
		} else {
			await scopedLogger.warn("Invalid subject categoryId", { subjectId });
			return Response.json({ error: "Invalid categoryId" }, { status: 400 });
		}
	}

	if (body.numericDecimals !== undefined) {
		if (
			typeof body.numericDecimals !== "number" ||
			!Number.isInteger(body.numericDecimals) ||
			body.numericDecimals < 0 ||
			body.numericDecimals > 3
		) {
			await scopedLogger.warn("Invalid numericDecimals", { subjectId });
			return Response.json(
				{ error: "numericDecimals must be 0-3" },
				{ status: 400 },
			);
		}

		if (effectiveValueType !== GRADE_VALUE_TYPE.NUMERIC) {
			await scopedLogger.warn(
				"numericDecimals only valid for numeric subjects",
				{ subjectId },
			);
			return Response.json(
				{ error: "numericDecimals can only be set for numeric subjects" },
				{ status: 400 },
			);
		}

		data.numericDecimals = body.numericDecimals;
	}

	const numericMin = toDecimalString(body.numericMin, "numericMin");
	if (numericMin !== undefined) {
		if (effectiveValueType !== GRADE_VALUE_TYPE.NUMERIC) {
			await scopedLogger.warn("numericMin only valid for numeric subjects", {
				subjectId,
			});
			return Response.json(
				{ error: "numericMin can only be set for numeric subjects" },
				{ status: 400 },
			);
		}
		data.numericMin = numericMin;
	}

	const numericMax = toDecimalString(body.numericMax, "numericMax");
	if (numericMax !== undefined) {
		if (effectiveValueType !== GRADE_VALUE_TYPE.NUMERIC) {
			await scopedLogger.warn("numericMax only valid for numeric subjects", {
				subjectId,
			});
			return Response.json(
				{ error: "numericMax can only be set for numeric subjects" },
				{ status: 400 },
			);
		}
		data.numericMax = numericMax;
	}

	if (body.literalScale !== undefined) {
		if (effectiveValueType !== GRADE_VALUE_TYPE.LITERAL) {
			await scopedLogger.warn("literalScale only valid for literal subjects", {
				subjectId,
			});
			return Response.json(
				{ error: "literalScale can only be set for literal subjects" },
				{ status: 400 },
			);
		}

		if (body.literalScale === null) {
			data.literalScale = Prisma.JsonNull;
		} else {
			data.literalScale = ensureLiteralScale(body.literalScale);
		}
	}

	// When switching value type, reset incompatible fields automatically.
	if (newValueType !== undefined) {
		if (newValueType === GRADE_VALUE_TYPE.NUMERIC) {
			data.literalScale = Prisma.JsonNull;
		} else {
			data.numericMin = null;
			data.numericMax = null;
			data.numericDecimals = null;
		}
	}

	const updated = await prisma.subject.update({
		where: { id: subjectId },
		data,
	});

	await scopedLogger.info("Updated subject", {
		subjectId,
		valueType: updated.valueType,
	});

	return Response.json({
		subject: {
			id: updated.id,
			label: updated.label,
			weight: updated.weight,
			categoryId: updated.categoryId,
			valueType: updated.valueType,
			numericMin: updated.numericMin?.toString() ?? null,
			numericMax: updated.numericMax?.toString() ?? null,
			numericDecimals: updated.numericDecimals,
			literalScale: updated.literalScale,
		},
	});
}

export async function DELETE(
	req: Request,
	context: RouteContext<"/api/admin/config/subjects/[subjectId]">,
): Promise<Response> {
	const logger = createApiLogger(`${ROUTE_SCOPE}#DELETE`);
	await logger.debug("Incoming request", { method: req.method, url: req.url });

	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		await logger.warn("Rejected access", { status: authContext.status });
		return authContext;
	}

	const scopedLogger = logger.with({ userId: authContext.user.id });

	const params = await context.params;
	const subjectId = params.subjectId;
	if (!subjectId) {
		await scopedLogger.warn("Missing subjectId parameter");
		return Response.json({ error: "Missing subjectId" }, { status: 400 });
	}

	try {
		await prisma.subject.delete({ where: { id: subjectId } });
		await scopedLogger.info("Deleted subject", { subjectId });
		return Response.json({ ok: true });
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				await scopedLogger.warn("Subject not found during delete", {
					subjectId,
				});
				return Response.json({ error: "Subject not found" }, { status: 404 });
			}

			if (error.code === "P2003") {
				await scopedLogger.warn("Cannot delete subject with related records", {
					subjectId,
				});
				return Response.json(
					{ error: "Cannot delete subject with related records" },
					{ status: 409 },
				);
			}
		}

		await scopedLogger.error("Failed to delete subject", {
			subjectId,
			reason: error instanceof Error ? error.message : "Unknown error",
		});
		return Response.json(
			{ error: "Failed to delete subject" },
			{ status: 500 },
		);
	}
}
