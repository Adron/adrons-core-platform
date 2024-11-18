export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">
          Adron&apos;s Core Platform
        </h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Central Command for Development Tools</h2>
          <p className="text-lg mb-4">
            Welcome to the Core Platform - your centralized hub for managing and accessing Adron&apos;s suite of development tools and applications. This platform provides unified access control, monitoring, and integration capabilities across all tools in the ecosystem.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Unified Access</h3>
            <p>Single sign-on capabilities for seamless access to all integrated tools and services in the Adron&apos;s Tools ecosystem.</p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Centralized Management</h3>
            <p>Monitor usage, manage permissions, and configure integrations for your development toolkit from one location.</p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Tool Integration</h3>
            <p>Connect and manage your development workflow across multiple tools with seamless integration capabilities.</p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Usage Analytics</h3>
            <p>Track and analyze your tool usage patterns to optimize your development workflow and resource allocation.</p>
          </div>
        </section>
        
        <section className="text-center">
          <p className="text-lg">
            Ready to streamline your development workflow? 
            <a href="/login" className="text-indigo-600 hover:text-indigo-800 ml-2 font-semibold">
              Sign in to get started
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}