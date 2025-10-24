import './globals.css'
import Link from 'next/link'
import Logo from './components/Logo'

export const metadata = {
  title: 'Zombie Land Legendary Suggestion Form',
  description: 'Suggest legendary items for the Rust server',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <div className="header">
            <Logo />
            <div className="title">Legendary Item Suggestion</div>
          </div>
          {children}
          <div className="footer-note">
            {' '}<Link href="/api/suggestions">View raw suggestions JSON</Link>
          </div>
        </div>
      </body>
    </html>
  )
}

