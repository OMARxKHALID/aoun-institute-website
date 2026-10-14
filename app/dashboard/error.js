"use client";

import ErrorState from "@/components/ui/error-state";

const ErrorPage = ({ retry }) => <ErrorState retry={retry} home="/dashboard" homeLabel="My dashboard" />;

export default ErrorPage;
