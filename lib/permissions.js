import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const ac = createAccessControl(defaultStatements);

const ADMIN = ac.newRole(adminAc.statements);

const TEACHER = ac.newRole({ user: [], session: [] });

const STUDENT = ac.newRole({ user: [], session: [] });

export const roles = { ADMIN, TEACHER, STUDENT };
