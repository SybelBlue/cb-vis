export interface Statement {
  type: 'stdout' | 'stderr';
  message: string;
}
