/**
 * Lista de UIDs de administradores com acesso ilimitado
 * Funciona tanto em desenvolvimento quanto em produção
 */
export const ADMIN_UIDS: string[] = [
  "VC84FK6HWsfVBCVCt43OK6xw9x43",
];

export function isAdmin(uid: string | null): boolean {
  if (!uid) return false;
  return ADMIN_UIDS.includes(uid);
}
