import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const pages = await prisma.page.findMany({
      where: status ? { status } : { status: 'published' },
      include: {
        author: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { title, content, slug, status, tags } = await request.json()

    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'Titre, contenu et slug requis' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug },
    })

    if (existingPage) {
      return NextResponse.json(
        { error: 'Une page avec ce slug existe déjà' },
        { status: 400 }
      )
    }

    const userId = parseInt((session.user as any).id)

    // Create page
    const page = await prisma.page.create({
      data: {
        title,
        content,
        slug,
        status: status || 'draft',
        authorId: userId,
        publishedAt: status === 'published' ? new Date() : null,
      },
    })

    // Create first revision
    await prisma.pageRevision.create({
      data: {
        pageId: page.id,
        revisionNumber: 1,
        title,
        content,
        authorId: userId,
      },
    })

    // Add tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        let tag = await prisma.tag.findUnique({
          where: { name: tagName },
        })

        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName },
          })
        }

        await prisma.pageTag.create({
          data: {
            pageId: page.id,
            tagId: tag.id,
          },
        })
      }
    }

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error('Error creating page:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la page' },
      { status: 500 }
    )
  }
}
