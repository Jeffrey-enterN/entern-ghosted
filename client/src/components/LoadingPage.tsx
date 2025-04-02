import LoadingMascot from './LoadingMascot';

interface LoadingPageProps {
  message?: string;
}

export default function LoadingPage({ message }: LoadingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <LoadingMascot size="lg" message={message} />
      
      <div className="mt-10 max-w-md text-center">
        <h2 className="text-xl font-semibold text-indigo-600 mb-2">
          Ghost Tamer is on the job!
        </h2>
        <p className="text-gray-600">
          We're working to make the hiring process more transparent for everyone. 
          Thanks for being part of our community!
        </p>
      </div>
    </div>
  );
}