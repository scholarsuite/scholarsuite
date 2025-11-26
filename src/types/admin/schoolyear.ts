export type SchoolYearStatus = "active" | "upcoming" | "archived";

export type EvaluationPeriodStatus = "planned" | "open" | "locked" | "archived";

export type AdminEvaluationPeriod = {
	id: string;
	label: string;
	startsAt: string;
	endsAt: string;
	order: number;
	status: EvaluationPeriodStatus;
};

export type AdminSchoolYear = {
	id: string;
	label: string;
	startsAt: string;
	endsAt: string;
	status: SchoolYearStatus;
	levels: string[];
	absenceUnits: string[];
	studentsCount: number;
	classesCount: number;
	groupsCount: number;
	evaluationPeriods: AdminEvaluationPeriod[];
	updatedAt: string;
	notes?: string | null;
};

export type SchoolYearListResponse = {
	schoolYears: AdminSchoolYear[];
};

export type CreateSchoolYearRequest = {
	label: string;
	startsAt: string;
	endsAt: string;
	levels?: string[];
};

export type CreateEvaluationPeriodRequest = {
	label: string;
	startsAt: string;
	endsAt: string;
	order?: number;
};
