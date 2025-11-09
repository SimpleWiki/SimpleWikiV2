import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  params: {
    slug: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: params.slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    if (!page) {
      return NextResponse.json(
        { error: 'Page non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la page' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { title, content, status, tags } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Titre et contenu requis' },
        { status: 400 }
      )
    }

    // Find the page
    const page = await prisma.page.findUnique({
      where: { slug: params.slug },
    })

    if (!page) {
      return NextResponse.json(
        { error: 'Page non trouvée' },
        { status: 404 }
      )
    }

    const userId = parseInt((session.user as any).id)
    const isAdmin = (session.user as any).isAdmin

    // Check if user can edit
    if (page.authorId !== userId && !isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Get last revision number
    const lastRevision = await prisma.pageRevision.findFirst({
      where: { pageId: page.id },
      orderBy: { revisionNumber: 'desc' },
    })

    const nextRevisionNumber = (lastRevision?.revisionNumber || 0) + 1

    // Update page in a transaction
    const updatedPage = await prisma.$transaction(async (tx) => {
      // Update page
      const updated = await tx.page.update({
        where: { id: page.id },
        data: {
          title,
          content,
          status,
          publishedAt: status === 'published' && !page.publishedAt ? new Date() : page.publishedAt,
        },
      })

      // Create new revision
      await tx.pageRevision.create({
        data: {
          pageId: page.id,
          revisionNumber: nextRevisionNumber,
          title,
          content,
          authorId: userId,
        },
      })

      // Update tags if provided
      if (tags && Array.isArray(tags)) {
        // Delete existing tags
        await tx.pageTag.deleteMany({
          where: { pageId: page.id },
        })

        // Add new tags
        for (const tagName of tags) {
          let tag = await tx.tag.findUnique({
            where: { name: tagName },
          })

          if (!tag) {
            tag = await tx.tag.create({
              data: {
                name: tagName,
                slug: tagName.toLowerCase().replace(/\s+/g, '-'),
              },
            })
          }

          await tx.pageTag.create({
            data: {
              pageId: page.id,
              tagId: tag.id,
            },
          })
        }
      }

      return updated
    })

    return NextResponse.json(updatedPage)
  } catch (error) {
    console.error('Error updating page:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la page' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Find the page
    const page = await prisma.page.findUnique({
      where: { slug: params.slug },
    })

    if (!page) {
      return NextResponse.json(
        { error: 'Page non trouvée' },
        { status: 404 }
      )
    }

    const userId = parseInt((session.user as any).id)
    const isAdmin = (session.user as any).isAdmin

    // Check if user can delete
    if (page.authorId !== userId && !isAdmin) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Delete page and all related data (cascading deletes should handle this)
    await prisma.page.delete({
      where: { id: page.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting page:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la page' },
      { status: 500 }
    )
  }
}
