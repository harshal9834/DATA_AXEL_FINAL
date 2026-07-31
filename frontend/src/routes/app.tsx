import { createFileRoute } from "@tanstack/react-router";
import AppShell from "../components/app-shell";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const Route = createFileRoute("/app")({
  component: () => (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  ),
});
