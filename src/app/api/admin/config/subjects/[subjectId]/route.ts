import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
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

export async function PATCH(
	req: Request,
	context: RouteContext<"/api/admin/config/subjects/[subjectId]">,
): Promise<Response> {
	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		return authContext;
	}

	const params = await context.params;
	const subjectId = params.subjectId;
	if (!subjectId) {
		return Response.json({ error: "Missing subjectId" }, { status: 400 });
	}

	let body: Record<string, unknown>;
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (Object.keys(body).length === 0) {
		return Response.json({ error: "No fields to update" }, { status: 400 });
	}

	const subject = await prisma.subject.findUnique({
		where: { id: subjectId },
	});

	if (!subject) {
		return Response.json({ error: "Subject not found" }, { status: 404 });
	}

	const data: Prisma.SubjectUpdateInput = {};

	if (body.label !== undefined) {
		if (typeof body.label !== "string" || body.label.trim().length === 0) {
			return Response.json({ error: "Invalid label" }, { status: 400 });
		}
		data.label = body.label.trim();
	}

	if (body.weight !== undefined) {
		if (typeof body.weight !== "number" || !Number.isFinite(body.weight)) {
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
			return Response.json(
				{ error: "numericDecimals must be 0-3" },
				{ status: 400 },
			);
		}

		if (effectiveValueType !== GRADE_VALUE_TYPE.NUMERIC) {
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
			return Response.json(
				{ error: "numericMax can only be set for numeric subjects" },
				{ status: 400 },
			);
		}
		data.numericMax = numericMax;
	}

	if (body.literalScale !== undefined) {
		if (effectiveValueType !== GRADE_VALUE_TYPE.LITERAL) {
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
	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		return authContext;
	}

	const params = await context.params;
	const subjectId = params.subjectId;
	if (!subjectId) {
		return Response.json({ error: "Missing subjectId" }, { status: 400 });
	}

	try {
		await prisma.subject.delete({ where: { id: subjectId } });
		return Response.json({ ok: true });
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				return Response.json({ error: "Subject not found" }, { status: 404 });
			}

			if (error.code === "P2003") {
				return Response.json(
					{ error: "Cannot delete subject with related records" },
					{ status: 409 },
				);
			}
		}

		return Response.json(
			{ error: "Failed to delete subject" },
			{ status: 500 },
		);
	}
}
