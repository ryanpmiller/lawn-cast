import PageLayout from '../components/PageLayout';
import LocationSection from '../components/LocationSection';
import LawnSettingsSection from '../components/LawnSettingsSection';
import SprinklerSection from '../components/SprinklerSection';
import ThemeToggleSection from '../components/ThemeToggleSection';
import NotificationSection from '../components/NotificationSection';
import DangerZoneSection from '../components/DangerZoneSection';

export default function SettingsPage() {
	return (
		<PageLayout title="Settings" alignItems="flex-start" titleAlign="left">
			<LocationSection />
			<LawnSettingsSection />
			<SprinklerSection />
			<ThemeToggleSection />
			<NotificationSection />
			<DangerZoneSection />
		</PageLayout>
	);
}
