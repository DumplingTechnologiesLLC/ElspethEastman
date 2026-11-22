def collection_records(page, key):
    """Partition the prefetched collection without adding database queries."""
    return [entry for entry in page.entries.all() if entry.collection == key]
