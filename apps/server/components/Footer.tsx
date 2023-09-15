const Footer = () => (
  <div className="flex flex-col justify-center gap-3 py-8 text-center text-gray-500">
    <span className="text-reelist-red pb-3 text-3xl">Reelist</span>
    Copyright @2023 All rights reserved
    <div>
      Video Source:
      <a href="https://www.themoviedb.org/" className="pl-1 text-gray-500 underline">
        TMDB
      </a>
      {' | '}
      Streaming Source:
      <a href="https://www.justwatch.com/" className="pl-1 text-gray-500 underline">
        Just Watch
      </a>
    </div>
    <div>
      Designed by:
      <a href="http://ineshamadi.com" className="pl-1 text-gray-500 underline">
        Ines Hamadi
      </a>
      {' | Source: '}
      <a href="https://github.com/mrdjohnson/reelist" className="text-gray-500 underline">
        Github
      </a>
    </div>
  </div>
)

export default Footer
