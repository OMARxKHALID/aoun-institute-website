"use client";

import ErrorState from "@/components/ui/error-state";

const ErrorPage = ({ retry }) => <ErrorState retry={retry} home="/admin" homeLabel="Admin dashboard" />;

export default ErrorPage;
