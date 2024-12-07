// app/page.tsx (Root page)
export default function RootPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">
                        Welcome to Digital Menu
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                        Scan the QR code at your table to begin
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-center mb-4">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <svg
                                className="w-12 h-12 text-gray-500"
                                fill="none"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                                />
                            </svg>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Open your phone's camera and point it at the QR code on your table
                    </p>
                </div>

                <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                    Need help? Ask your server for assistance
                </div>
            </div>
        </div>
    );
}