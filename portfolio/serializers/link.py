def link_value(label, url):
    return None if url is None else {"label": label, "href": url, "is_external": True}


def expand_link_input(data, name):
    values = dict(data)
    if name in values:
        link = values.pop(name)
        values[f"{name}_label"] = None if link is None else link["label"]
        values[f"{name}_url"] = None if link is None else link["url"]
    return values
