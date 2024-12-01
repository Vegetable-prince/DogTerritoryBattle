from django.shortcuts import render


def home_view(request):
    """
    ホームページをレンダリングするビュー。

    Args:
        request (HttpRequest): HTTPリクエストオブジェクト。

    Returns:
        HttpResponse: レンダリングされたHTMLを含むレスポンス。
    """
    return render(request, "index.html")
