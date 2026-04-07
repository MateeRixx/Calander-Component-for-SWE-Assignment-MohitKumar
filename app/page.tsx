import NoirCalendar from '@/components/NoirCalendar';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B121A', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '1000px' }}>
        <NoirCalendar accentColor="#7b9ab8" />
      </div>
    </main>
  );
}
