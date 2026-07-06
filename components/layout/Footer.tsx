export default function Footer() {
    return (
      <footer className="mt-24 border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 py-10 text-center text-slate-500 md:flex-row">
          <p>© 2026 Zipora. Powered by NorthStar.</p>
  
          <div className="flex gap-6">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    );
  }