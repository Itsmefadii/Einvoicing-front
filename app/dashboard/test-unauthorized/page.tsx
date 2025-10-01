'use client';

export default function TestUnauthorizedPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-red-600">This page should be protected!</h1>
      <p className="mt-4 text-gray-600">
        If you can see this page, the route protection is not working properly.
        This page should redirect you back to the dashboard with an access denied message.
      </p>
    </div>
  );
}
