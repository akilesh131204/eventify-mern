const Spinner = ({ size = 'h-8 w-8', full = false }) => {
  const spinner = (
    <div className={`animate-spin ${size} border-4 border-primary-600 border-t-transparent rounded-full`} />
  );
  if (full) {
    return <div className="min-h-[60vh] flex items-center justify-center">{spinner}</div>;
  }
  return spinner;
};

export default Spinner;
