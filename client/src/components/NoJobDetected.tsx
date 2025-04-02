export default function NoJobDetected() {
  return (
    <div className="p-4 bg-white">
      <div className="text-center py-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No job listing detected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Navigate to a job listing on LinkedIn, Indeed, ZipRecruiter, or Monster to see ghosting data.
        </p>
      </div>
    </div>
  );
}
