import { Hexagon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2.5 group">
            <Hexagon size={26} className="text-foreground fill-foreground/10 stroke-[2px] transition-transform duration-500 group-hover:rotate-90" />
            <span className="font-bold text-lg tracking-tight text-foreground">
                CollabKit.
            </span>
        </Link>
    )
}

export default Logo