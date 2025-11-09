import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.trim() === '') {
    return NextResponse.json({ results: [] })
  }

  try {
    const pages = await prisma.page.findMany({
      where: {
        status: 'published',
        OR: [
          {
            title: {
              contains: query,
            },
          },
          {
            content: {
              contains: query,
            },
          },
        ],
      },
      include: {
        author: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 20,
    })

    const results = pages.map((page) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      excerpt: page.content.substring(0, 200) + '...',
      author: page.author,
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
