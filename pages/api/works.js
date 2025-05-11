// pages/api/works.js
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // アニメ作品を取得
        const animeWorks = await prisma.work.findMany({
            where: {
                category: {
                    name: 'アニメ'
                },
                workRoles: {
                    some: {
                        role: {
                            actor: {
                                name: '佐藤拓也'
                            }
                        }
                    }
                }
            },
            include: {
                workRoles: {
                    where: {
                        role: {
                            actor: {
                                name: '佐藤拓也'
                            }
                        }
                    },
                    include: {
                        role: true
                    }
                }
            },
            orderBy: [
                { year: 'desc' },
                { title: 'asc' }
            ]
        });

        // ゲーム作品を取得
        const gameWorks = await prisma.work.findMany({
            where: {
                category: {
                    name: 'ゲーム'
                },
                workRoles: {
                    some: {
                        role: {
                            actor: {
                                name: '佐藤拓也'
                            }
                        }
                    }
                }
            },
            include: {
                workRoles: {
                    where: {
                        role: {
                            actor: {
                                name: '佐藤拓也'
                            }
                        }
                    },
                    include: {
                        role: true
                    }
                }
            },
            orderBy: [
                { year: 'desc' },
                { title: 'asc' }
            ]
        });

        // 吹き替え（映画）を取得
        const dubMovieWorks = await prisma.work.findMany({
            where: {
                category: {
                    name: '吹き替え（映画）'
                },
                workRoles: {
                    some: {
                        role: {
                            actor: {
                                name: '佐藤拓也'
                            }
                        }
                    }
                }
            },
            include: {
                workRoles: {
                    where: {
                        role: {
                            actor: {
                                name: '佐藤拓也'
                            }
                        }
                    },
                    include: {
                        role: true
                    }
                }
            },
            orderBy: [
                { year: 'desc' },
                { title: 'asc' }
            ]
        });

        // 吹き替え（ドラマ）を取得
        const dubDramaWorks = await prisma.work.findMany({
            where: {
                category: {
                    name: '吹き替え（ドラマ）'
                },
                workRoles: {
                    some: {
                        role: {
                            actor: {
                                name: '佐藤拓也'
                            }
                        }
                    }
                }
            },
            include: {
                workRoles: {
                    where: {
                        role: {
                            actor: {
                                name: '佐藤拓也'
                            }
                        }
                    },
                    include: {
                        role: true
                    }
                }
            },
            orderBy: [
                { year: 'desc' },
                { title: 'asc' }
            ]
        });

        // ナレーションを取得
        const narrationWorks = await prisma.work.findMany({
            where: {
                category: {
                    name: 'ナレーション'
                }
            },
            orderBy: [
                { year: 'desc' },
                { title: 'asc' }
            ]
        });

        // ラジオ・配信番組を取得
        const radioWorks = await prisma.work.findMany({
            where: {
                category: {
                    name: 'ラジオ'
                }
            },
            orderBy: [
                { year: 'desc' },
                { title: 'asc' }
            ]
        });

        // 整形してレスポンス
        const formattedWorks = {
            anime: animeWorks.map(work => ({
                id: work.id,
                title: work.title,
                role: work.workRoles[0]?.role.name ? `${work.workRoles[0].role.name} 役` : '',
                isMain: work.workRoles[0]?.isMainRole || false,
                year: work.year ? `${work.year}年` : ''
            })),
            game: gameWorks.map(work => ({
                id: work.id,
                title: work.title,
                role: work.workRoles[0]?.role.name ? `${work.workRoles[0].role.name} 役` : '',
                isMain: work.workRoles[0]?.isMainRole || false,
                year: work.year ? `${work.year}年` : ''
            })),
            dub: {
                movie: dubMovieWorks.map(work => ({
                    id: work.id,
                    title: work.title,
                    role: work.workRoles[0]?.role.name ? `${work.workRoles[0].role.name} 役` : '',
                    isMain: work.workRoles[0]?.isMainRole || false,
                    year: work.year ? `${work.year}年` : ''
                })),
                drama: dubDramaWorks.map(work => ({
                    id: work.id,
                    title: work.title,
                    role: work.workRoles[0]?.role.name ? `${work.workRoles[0].role.name} 役` : '',
                    isMain: work.workRoles[0]?.isMainRole || false,
                    year: work.year ? `${work.year}年` : ''
                }))
            },
            other: {
                narration: narrationWorks.map(work => ({
                    id: work.id,
                    title: work.title,
                    role: work.description || '',
                    year: work.year ? `${work.year}年` : ''
                })),
                radio: radioWorks.map(work => ({
                    id: work.id,
                    title: work.title,
                    year: work.year ? `${work.year}年～` : ''
                }))
            }
        };

        return res.status(200).json(formattedWorks);
    } catch (error) {
        console.error('作品データの取得エラー:', error);
        return res.status(500).json({ error: '作品データの取得に失敗しました' });
    }
}