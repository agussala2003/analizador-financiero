// --- Componente Loader (Spinner) ---
import LoaderComponent from '../ui/Loader';

export const Loader = () => (
  <div className="flex justify-center items-center py-10">
    <LoaderComponent variant="spin" size="lg" color="blue" />
  </div>
);
