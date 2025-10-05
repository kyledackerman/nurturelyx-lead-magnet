// This file contains the additions to insert into AdminDashboard.tsx after line 291

  const fetchHotLeadsCount = async () => {
    try {
      const { data, error } = await supabase
        .from('prospect_activities')
        .select('id', { count: 'exact' })
        .eq('priority', 'hot')
        .in('status', ['new', 'contacted', 'proposal']);

      if (error) throw error;
      setHotLeadsCount(data?.length || 0);
    } catch (error) {
      console.error("Error fetching hot leads:", error);
    }
  };
