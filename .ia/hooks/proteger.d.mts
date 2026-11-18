export interface Decision {
  bloquear: boolean;
  motivo?: string;
}
export function dentroDe(raiz: string, ruta: string): boolean;
export function rutasDelComando(comando: string): string[];
export function evaluar(entrada: unknown, raiz: string): Decision;
