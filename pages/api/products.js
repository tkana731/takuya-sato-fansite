// pages/api/products.js
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const { category, tab } = req.query;

  try {
    let products = [];

    if (category === 'upcoming') {
      // 直近発売予定の商品を取得（発売日が今日以降、3ヶ月以内）
      const today = new Date().toISOString().split('T')[0];
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      const threeMonthsLaterStr = threeMonthsLater.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          mst_product_categories!inner (
            id,
            name,
            code
          ),
          product_variation_groups (
            id,
            name
          ),
          rel_product_affiliate_links (
            url,
            image_url,
            mst_affiliate_platforms (
              name,
              code
            )
          ),
          rel_work_products (
            description,
            works (
              id,
              title
            )
          ),
          rel_schedule_products (
            description,
            schedules (
              id,
              title
            )
          )
        `)
        .or(`release_date.gte.${today}.and.release_date.lte.${threeMonthsLaterStr},is_preorder.eq.true.and.preorder_end_date.gte.${today}`)
        .order('release_date', { ascending: true })
        .order('display_order', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching upcoming products:', error);
        return res.status(200).json([]);
      }

      products = data || [];
    } else if (tab) {
      // カテゴリ別の商品を取得
      let query = supabase
        .from('products')
        .select(`
          *,
          mst_product_categories!inner (
            id,
            name,
            code
          ),
          product_variation_groups (
            id,
            name,
            description
          ),
          rel_product_affiliate_links (
            url,
            image_url,
            mst_affiliate_platforms (
              name,
              code
            )
          ),
          rel_work_products (
            description,
            works (
              id,
              title
            )
          ),
          rel_schedule_products (
            description,
            schedules (
              id,
              title
            )
          ),
          rel_product_series_items (
            volume_number,
            volume_title,
            display_order,
            product_series (
              id,
              name,
              description,
              has_variations
            ),
            product_series_variations (
              id,
              variation_name,
              display_order
            )
          )
        `)
        .order('release_date', { ascending: false })
        .order('display_order', { ascending: true });

      // カテゴリフィルター
      if (tab !== 'all') {
        query = query.eq('mst_product_categories.code', tab);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        return res.status(200).json({ series: [], standalone: [] });
      }

      // シリーズごとにグループ化
      const seriesMap = new Map();
      const standaloneProducts = [];

      (data || []).forEach(product => {
        if (product.rel_product_series_items && product.rel_product_series_items.length > 0) {
          product.rel_product_series_items.forEach(seriesItem => {
            const seriesId = seriesItem.product_series.id;
            if (!seriesMap.has(seriesId)) {
              seriesMap.set(seriesId, {
                series: seriesItem.product_series,
                products: []
              });
            }
            seriesMap.get(seriesId).products.push({
              ...product,
              volumeNumber: seriesItem.volume_number,
              volumeTitle: seriesItem.volume_title,
              variation: seriesItem.product_series_variations
            });
          });
        } else {
          standaloneProducts.push(product);
        }
      });

      // シリーズ内でソート
      seriesMap.forEach((value) => {
        value.products.sort((a, b) => {
          // 同じボリューム番号の場合はバリエーションでソート
          if (a.volumeNumber === b.volumeNumber) {
            return (a.variation?.display_order || 0) - (b.variation?.display_order || 0);
          }
          return (a.volumeNumber || 0) - (b.volumeNumber || 0);
        });
      });

      products = {
        series: Array.from(seriesMap.values()),
        standalone: standaloneProducts
      };
    }

    // 商品データをフォーマット
    const formatProduct = (product) => ({
      id: product.id,
      title: product.title,
      productCode: product.product_code,
      releaseDate: product.release_date,
      releaseDateDisplay: product.release_date_display,
      isPreorder: product.is_preorder,
      preorderStartDate: product.preorder_start_date,
      preorderEndDate: product.preorder_end_date,
      description: product.description,
      officialUrl: product.official_url,
      category: product.mst_product_categories,
      variationDescription: product.variation_description,
      affiliateLinks: product.rel_product_affiliate_links?.map(link => ({
        platform: link.mst_affiliate_platforms?.name,
        code: link.mst_affiliate_platforms?.code,
        url: link.url,
        imageUrl: link.image_url
      })),
      relatedWorks: product.rel_work_products?.map(wp => ({
        id: wp.works?.id,
        title: wp.works?.title,
        description: wp.description
      })),
      relatedSchedules: product.rel_schedule_products?.map(sp => ({
        id: sp.schedules?.id,
        title: sp.schedules?.title,
        description: sp.description
      })),
      volumeNumber: product.volumeNumber,
      volumeTitle: product.volumeTitle,
      variation: product.variation
    });

    let response;
    if (category === 'upcoming') {
      response = products.map(formatProduct);
    } else if (tab) {
      response = {
        series: products.series?.map(s => ({
          ...s.series,
          products: s.products.map(formatProduct)
        })),
        standalone: products.standalone?.map(formatProduct)
      };
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in products API:', error);
    if (category === 'upcoming') {
      res.status(200).json([]);
    } else {
      res.status(200).json({ series: [], standalone: [] });
    }
  }
}