"use client";

import ErrorState from "@/components/ui/error-state";

const ErrorPage = ({ retry }) => <ErrorState retry={retry} className="min-h-[70vh] pt-32" />;

export default ErrorPage;
