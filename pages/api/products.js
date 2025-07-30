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
        .from('product_base')
        .select(`
          *,
          category:mst_product_categories!inner (
            id,
            name,
            code
          ),
          variants:product_variants (
            id,
            variant_name,
            product_code,
            price,
            official_url,
            special_features,
            status,
            display_order,
            media_type:mst_media_types (
              name,
              code
            ),
            affiliate_links:rel_product_affiliate_links (
              url,
              image_url,
              platform:mst_affiliate_platforms (
                name,
                code
              )
            )
          ),
          work:works (
            id,
            title
          )
        `)
        .or(`release_date.gte.${today}.and.release_date.lte.${threeMonthsLaterStr}`)
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
        .from('product_base')
        .select(`
          *,
          category:mst_product_categories!inner (
            id,
            name,
            code
          ),
          variants:product_variants (
            id,
            variant_name,
            product_code,
            price,
            official_url,
            special_features,
            status,
            display_order,
            media_type:mst_media_types (
              name,
              code
            ),
            affiliate_links:rel_product_affiliate_links (
              url,
              image_url,
              platform:mst_affiliate_platforms (
                name,
                code
              )
            )
          ),
          work:works (
            id,
            title
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

      // 新しい構造では基本的に全て単独商品として扱う
      // シリーズ名が同じものがあればグループ化
      const seriesMap = new Map();
      const standaloneProducts = [];

      (data || []).forEach(product => {
        if (product.series_name) {
          const seriesKey = product.series_name;
          if (!seriesMap.has(seriesKey)) {
            seriesMap.set(seriesKey, {
              id: seriesKey,
              name: product.series_name,
              description: null,
              products: []
            });
          }
          seriesMap.get(seriesKey).products.push({
            ...product,
            volumeNumber: product.volume_number,
            volumeTitle: product.volume_title
          });
        } else {
          standaloneProducts.push(product);
        }
      });

      // シリーズ内でボリューム番号でソート
      seriesMap.forEach((value) => {
        value.products.sort((a, b) => {
          return (a.volume_number || 0) - (b.volume_number || 0);
        });
      });

      products = {
        series: Array.from(seriesMap.values()),
        standalone: standaloneProducts
      };
    }

    // 商品データをフォーマット
    const formatProduct = (product) => {
      // variants から代表的な情報を取得（通常は最初のvariant）
      const primaryVariant = product.variants?.[0];
      
      return {
        id: product.id,
        title: product.title,
        productCode: primaryVariant?.product_code || null,
        releaseDate: product.release_date,
        releaseDateDisplay: product.release_date_display,
        isPreorder: false, // 新構造では予約管理は別で行う
        preorderStartDate: null,
        preorderEndDate: null,
        description: product.description,
        officialUrl: product.official_url || primaryVariant?.official_url,
        category: product.category,
        variationDescription: null, // 複数バリエーションは variants で管理
        variants: product.variants?.map(variant => ({
          id: variant.id,
          name: variant.variant_name,
          productCode: variant.product_code,
          price: variant.price,
          officialUrl: variant.official_url,
          mediaType: variant.media_type,
          specialFeatures: variant.special_features,
          status: variant.status,
          affiliateLinks: variant.affiliate_links?.map(link => ({
            platform: link.platform?.name,
            code: link.platform?.code,
            url: link.url,
            imageUrl: link.image_url
          })) || []
        })) || [],
        affiliateLinks: primaryVariant?.affiliate_links?.map(link => ({
          platform: link.platform?.name,
          code: link.platform?.code,
          url: link.url,
          imageUrl: link.image_url
        })) || [],
        relatedWorks: product.work ? [{
          id: product.work.id,
          title: product.work.title,
          description: null
        }] : [],
        relatedSchedules: [],
        volumeNumber: product.volume_number,
        volumeTitle: product.volume_title,
        seriesName: product.series_name,
        castInterviewUrl: product.cast_interview_url
      };
    };

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