export const BS_SIMPLE_CREDIT = 'bs-simple.com · פתרונות יצירתיים · בועז סעדה';

/** bs-simple logo + the exact credit line, linking to bs-simple.com (QA WS-09). */
export default function BsSimpleCredit() {
  return (
    <a
      href="https://bs-simple.com"
      target="_blank"
      rel="noopener noreferrer"
      data-testid="bs-simple-credit"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#888', fontSize: 12, textDecoration: 'none', borderTop: '1px solid #1E1E1E', paddingTop: 20 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/bs-simple-monogram.png" alt="bs-simple" width={48} height={48} style={{ borderRadius: 10, background: '#fff', padding: 4 }} />
      <span dir="rtl">{BS_SIMPLE_CREDIT}</span>
    </a>
  );
}
