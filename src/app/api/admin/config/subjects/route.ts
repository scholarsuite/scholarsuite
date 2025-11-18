import { getAuthorizedSystemAdmin } from "#lib/authz.ts";
import { prisma } from "#lib/prisma.ts";
import type { Prisma } from "#prisma/client";
import { GRADE_VALUE_TYPE } from "#prisma/client";

type SubjectPayload = {
	label?: unknown;
	weight?: unknown;
	categoryId?: unknown;
	valueType?: unknown;
	numericMin?: unknown;
	numericMax?: unknown;
	numericDecimals?: unknown;
	literalScale?: unknown;
};

type ValidatedSubjectPayload = {
	label: string;
	weight: number;
	categoryId: string | null;
	valueType: GRADE_VALUE_TYPE;
	numericMin: string | null;
	numericMax: string | null;
	numericDecimals: number | null;
	literalScale: Prisma.InputJsonValue | null;
};

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

function validateSubjectPayload(body: SubjectPayload): ValidatedSubjectPayload {
	if (typeof body.label !== "string" || body.label.trim().length === 0) {
		throw new Error("label is required");
	}

	const label = body.label.trim();

	const weight =
		typeof body.weight === "number" && Number.isFinite(body.weight)
			? body.weight
			: 0;

	let categoryId: string | null = null;
	if (typeof body.categoryId === "string" && body.categoryId.trim()) {
		categoryId = body.categoryId.trim();
	}

	let valueType: GRADE_VALUE_TYPE = GRADE_VALUE_TYPE.NUMERIC;
	if (typeof body.valueType === "string") {
		const normalized = body.valueType.trim().toUpperCase();
		if (normalized in GRADE_VALUE_TYPE) {
			valueType = GRADE_VALUE_TYPE[normalized as keyof typeof GRADE_VALUE_TYPE];
		} else {
			throw new Error("Invalid valueType");
		}
	}

	let numericDecimals: number | null = null;
	if (body.numericDecimals !== undefined) {
		if (
			typeof body.numericDecimals !== "number" ||
			!Number.isInteger(body.numericDecimals) ||
			body.numericDecimals < 0 ||
			body.numericDecimals > 3
		) {
			throw new Error("numericDecimals must be an integer between 0 and 3");
		}
		numericDecimals = body.numericDecimals;
	}

	function toDecimalString(value: unknown, field: string): string | null {
		if (value === undefined || value === null || value === "") {
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

	let numericMin: string | null = null;
	let numericMax: string | null = null;
	let literalScale: Prisma.InputJsonValue | null = null;

	if (valueType === GRADE_VALUE_TYPE.NUMERIC) {
		numericMin = toDecimalString(body.numericMin, "numericMin");
		numericMax = toDecimalString(body.numericMax, "numericMax");
		literalScale = null;
	} else {
		numericMin = null;
		numericMax = null;
		numericDecimals = null;
		literalScale = ensureLiteralScale(body.literalScale);
	}

	return {
		label,
		weight,
		categoryId,
		valueType,
		numericMin,
		numericMax,
		numericDecimals,
		literalScale,
	};
}

export async function POST(req: Request): Promise<Response> {
	const authContext = await getAuthorizedSystemAdmin(req.headers);
	if (authContext instanceof Response) {
		return authContext;
	}

	let body: SubjectPayload;
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "Invalid JSON" }, { status: 400 });
	}

	let validated: ValidatedSubjectPayload;
	try {
		validated = validateSubjectPayload(body);
	} catch (error) {
		return Response.json(
			{ error: error instanceof Error ? error.message : "Invalid payload" },
			{ status: 400 },
		);
	}

	const subject = await prisma.subject.create({
		data: {
			label: validated.label,
			weight: validated.weight,
			valueType: validated.valueType,
			numericMin: validated.numericMin ?? undefined,
			numericMax: validated.numericMax ?? undefined,
			numericDecimals: validated.numericDecimals ?? undefined,
			literalScale: validated.literalScale ?? undefined,
			...(validated.categoryId
				? { category: { connect: { id: validated.categoryId } } }
				: {}),
		},
	});

	return Response.json(
		{
			subject: {
				id: subject.id,
				label: subject.label,
				weight: subject.weight,
				categoryId: subject.categoryId,
				valueType: subject.valueType,
				numericMin: subject.numericMin?.toString() ?? null,
				numericMax: subject.numericMax?.toString() ?? null,
				numericDecimals: subject.numericDecimals,
				literalScale: subject.literalScale,
			},
		},
		{ status: 201 },
	);
}
