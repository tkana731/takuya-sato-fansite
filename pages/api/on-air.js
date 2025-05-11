// pages/api/on-air.js
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // 現在放送中のアニメを取得
        const animeOnAir = await prisma.work.findMany({
            where: {
                category: {
                    name: 'アニメ'
                },
                broadcastChannels: {
                    some: {
                        broadcastEndDate: {
                            gt: new Date()
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
                },
                broadcastChannels: {
                    include: {
                        station: true,
                        weekday: true
                    }
                }
            },
            orderBy: {
                title: 'asc'
            }
        });

        // ラジオ・配信番組を取得
        const radioOnAir = await prisma.work.findMany({
            where: {
                category: {
                    name: 'ラジオ'
                },
                broadcastChannels: {
                    some: {
                        broadcastEndDate: {
                            gt: new Date()
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
                },
                broadcastChannels: {
                    include: {
                        station: true,
                        weekday: true
                    }
                }
            },
            orderBy: {
                title: 'asc'
            }
        });

        // WEB番組を取得
        const webOnAir = await prisma.work.findMany({
            where: {
                category: {
                    name: 'WEB'
                },
                broadcastChannels: {
                    some: {
                        broadcastEndDate: {
                            gt: new Date()
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
                },
                broadcastChannels: {
                    include: {
                        station: true,
                        weekday: true
                    }
                }
            },
            orderBy: {
                title: 'asc'
            }
        });

        return res.status(200).json({
            anime: animeOnAir,
            radio: radioOnAir,
            web: webOnAir
        });
    } catch (error) {
        console.error('放送中コンテンツの取得エラー:', error);
        return res.status(500).json({ error: '放送中コンテンツの取得に失敗しました' });
    }
}