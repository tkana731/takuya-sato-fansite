-- CreateTable
CREATE TABLE "mst_work_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mst_work_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "works" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "description" TEXT,
    "officialUrl" TEXT,
    "xUrl" TEXT,
    "instagramUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_broadcast_stations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "officialUrl" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mst_broadcast_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_station_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mst_station_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_weekdays" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mst_weekdays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rel_broadcast_channels" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "weekdayId" TEXT,
    "broadcastTime" TIME,
    "displayBroadcastTime" TEXT,
    "broadcastStartDate" DATE NOT NULL,
    "broadcastEndDate" DATE,
    "pageUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rel_broadcast_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "actorId" TEXT,
    "birthday" TEXT,
    "seriesName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mst_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_actors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "officialUrl" TEXT,
    "xUrl" TEXT,
    "instagramUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mst_actors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rel_work_roles" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "isMainRole" BOOLEAN NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rel_work_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_schedule_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorCode" TEXT NOT NULL,
    "hasPeriod" BOOLEAN NOT NULL,
    "hasPerformances" BOOLEAN NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mst_schedule_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_prefectures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mst_prefectures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_venues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "postalCode" TEXT,
    "prefectureId" TEXT NOT NULL,
    "address" TEXT,
    "capacity" TEXT,
    "officialUrl" TEXT,
    "googleMapsUrl" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mst_venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "workId" TEXT,
    "seriesId" TEXT,
    "venueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "isAllDay" BOOLEAN NOT NULL,
    "description" TEXT,
    "officialUrl" TEXT,
    "xUrl" TEXT,
    "instagramUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rel_schedule_performances" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "performanceDate" DATE NOT NULL,
    "startTime" TIME,
    "endTime" TIME,
    "displayStartTime" TEXT,
    "displayEndTime" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rel_schedule_performances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_performers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isTakuyaSato" BOOLEAN NOT NULL,
    "officialUrl" TEXT,
    "xUrl" TEXT,
    "instagramUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mst_performers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rel_work_performers" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "performerId" TEXT NOT NULL,
    "roleDescription" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rel_work_performers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rel_schedule_performers" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "performerId" TEXT NOT NULL,
    "roleDescription" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rel_schedule_performers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "officialUrl" TEXT,
    "xUrl" TEXT,
    "instagramUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mst_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_staff_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mst_staff_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rel_work_staff" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "staffRoleId" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rel_work_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "workId" TEXT,
    "title" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "publishedAt" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_series" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "officialUrl" TEXT,
    "xUrl" TEXT,
    "instagramUrl" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mst_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rel_work_series" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "sequenceNumber" INTEGER,
    "subtitle" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rel_work_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mst_work_relation_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mst_work_relation_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rel_related_works" (
    "id" TEXT NOT NULL,
    "parentWorkId" TEXT NOT NULL,
    "childWorkId" TEXT NOT NULL,
    "relationTypeId" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rel_related_works_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "works" ADD CONSTRAINT "works_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "mst_work_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mst_broadcast_stations" ADD CONSTRAINT "mst_broadcast_stations_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "mst_station_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_broadcast_channels" ADD CONSTRAINT "rel_broadcast_channels_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_broadcast_channels" ADD CONSTRAINT "rel_broadcast_channels_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "mst_broadcast_stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_broadcast_channels" ADD CONSTRAINT "rel_broadcast_channels_weekdayId_fkey" FOREIGN KEY ("weekdayId") REFERENCES "mst_weekdays"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mst_roles" ADD CONSTRAINT "mst_roles_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "mst_actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_work_roles" ADD CONSTRAINT "rel_work_roles_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_work_roles" ADD CONSTRAINT "rel_work_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "mst_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mst_venues" ADD CONSTRAINT "mst_venues_prefectureId_fkey" FOREIGN KEY ("prefectureId") REFERENCES "mst_prefectures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "mst_schedule_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "mst_venues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_schedule_performances" ADD CONSTRAINT "rel_schedule_performances_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_work_performers" ADD CONSTRAINT "rel_work_performers_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_work_performers" ADD CONSTRAINT "rel_work_performers_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "mst_performers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_schedule_performers" ADD CONSTRAINT "rel_schedule_performers_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_schedule_performers" ADD CONSTRAINT "rel_schedule_performers_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "mst_performers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_work_staff" ADD CONSTRAINT "rel_work_staff_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_work_staff" ADD CONSTRAINT "rel_work_staff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "mst_staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_work_staff" ADD CONSTRAINT "rel_work_staff_staffRoleId_fkey" FOREIGN KEY ("staffRoleId") REFERENCES "mst_staff_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_work_series" ADD CONSTRAINT "rel_work_series_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "mst_series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_work_series" ADD CONSTRAINT "rel_work_series_workId_fkey" FOREIGN KEY ("workId") REFERENCES "works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_related_works" ADD CONSTRAINT "rel_related_works_parentWorkId_fkey" FOREIGN KEY ("parentWorkId") REFERENCES "works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_related_works" ADD CONSTRAINT "rel_related_works_childWorkId_fkey" FOREIGN KEY ("childWorkId") REFERENCES "works"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rel_related_works" ADD CONSTRAINT "rel_related_works_relationTypeId_fkey" FOREIGN KEY ("relationTypeId") REFERENCES "mst_work_relation_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
