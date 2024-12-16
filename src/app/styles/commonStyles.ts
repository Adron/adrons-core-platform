export const commonStyles = {
  input: (isDark: boolean) => `
    mt-1 block w-full rounded-md 
    ${isDark 
      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
    }
    shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
  `,
  
  container: (isDark: boolean) => `
    max-w-7xl mx-auto p-4 sm:p-6 lg:p-8
    ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
  `,

  heading: (isDark: boolean) => `
    text-2xl font-semibold mb-6
    ${isDark ? 'text-white' : 'text-gray-900'}
  `,

  subheading: (isDark: boolean) => `
    text-xl font-semibold mb-4
    ${isDark ? 'text-white' : 'text-gray-900'}
  `,

  table: {
    container: (isDark: boolean) => `
      overflow-x-auto
      ${isDark ? 'bg-gray-800' : 'bg-white'}
    `,
    header: (isDark: boolean) => `
      ${isDark ? 'bg-gray-700' : 'bg-gray-50'}
    `,
    headerCell: (isDark: boolean) => `
      px-6 py-3 text-left text-xs font-medium uppercase tracking-wider
      ${isDark ? 'text-gray-300' : 'text-gray-500'}
    `,
    row: (isDark: boolean) => `
      ${isDark ? 'border-gray-700' : 'border-gray-200'}
    `,
    cell: (isDark: boolean) => `
      px-6 py-4 whitespace-nowrap text-sm
      ${isDark ? 'text-gray-300' : 'text-gray-900'}
    `,
  },

  button: (isDark: boolean, isLoading: boolean) => `
    inline-flex justify-center rounded-md border border-transparent 
    px-4 py-2 text-sm font-medium text-white shadow-sm
    ${isLoading 
      ? 'bg-indigo-400 cursor-not-allowed' 
      : `bg-indigo-600 hover:bg-indigo-700 
         focus:outline-none focus:ring-2 focus:ring-offset-2 
         focus:ring-indigo-500
         ${isDark ? 'focus:ring-offset-gray-900' : ''}`
    }
  `,

  error: (isDark: boolean) => `
    ${isDark 
      ? 'bg-red-900/50 border-red-500 text-red-200' 
      : 'bg-red-100 border-red-400 text-red-700'
    }
    px-4 py-3 rounded relative border
  `,
}; 