import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const ac = createAccessControl(defaultStatements);

const ADMIN = ac.newRole(adminAc.statements);

const STUDENT = ac.newRole({ user: [], session: [] });

export const roles = { ADMIN, STUDENT };
