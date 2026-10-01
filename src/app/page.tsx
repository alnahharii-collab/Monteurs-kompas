import { AppHeader } from '@/components/ui/AppHeader';
import { Screen } from '@/components/ui/Screen';
import { ResumeAction } from '@/features/diagnosis/ResumeAction';
import { ApplianceSearch } from '@/features/search/ApplianceSearch';

export default function HomePage() {
  return (
    <Screen header={<AppHeader title="Monteur Kompas" />}>
      <div className="pt-4">
        <ResumeAction />
      </div>
      <h1 className="pt-6 pb-4 text-question font-semibold">Welk toestel?</h1>
      <ApplianceSearch />
    </Screen>
  );
}
