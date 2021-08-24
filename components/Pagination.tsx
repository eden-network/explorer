export default function Pagination({ numPages, perPage, total, activePage, setPage }: { numPages: number, perPage: number, total: number, activePage: number, setPage: (page: number) => any }) {
    return (<div className="px-4 py-3 flex items-center justify-between sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
            <a
                onClick={() => setPage(activePage === 0 ? activePage : activePage - 1)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
                Previous
            </a>
            <a
                onClick={() => setPage(activePage === numPages - 1 ? activePage : activePage + 1)}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
                Next
            </a>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
                <p className="text-sm text-gray-400">
                    Showing <span className="font-medium">{activePage * perPage + 1}</span> to <span className="font-medium">{activePage * perPage + perPage}</span> of{' '}
                    <span className="font-medium">{total}</span> results
                </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
                <a
                    onClick={() => setPage(activePage === 0 ? activePage : activePage - 1)}
                    className="relative inline-flex items-center text-sm font-medium rounded-md bg-blue-light hover:bg-green hover:text-blue"
                >
                    Previous
                </a>
                <a
                    onClick={() => setPage(activePage === numPages - 1 ? activePage : activePage + 1)}
                    className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-light hover:bg-green hover:text-blue"
                >
                    Next
                </a>
            </div>
        </div>
    </div>);
}