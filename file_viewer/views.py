from django.contrib.admin.views.decorators import staff_member_required  # 追加
from django.contrib.auth.decorators import login_required  # 追加
import os
import tempfile
import zipfile
from django.shortcuts import render, redirect
from django.conf import settings
from .forms import UploadFileForm
from .utils import parse_gitignore, build_directory_tree

# デコレーターを追加
@staff_member_required  # 管理スタッフ（スーパーユーザー含む）のみアクセス可能
def upload_file(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            uploaded_file = form.save()
            # 一時ディレクトリを作成
            with tempfile.TemporaryDirectory() as tmpdirname:
                # ZIPファイルを解凍
                zip_path = uploaded_file.file.path
                try:
                    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                        zip_ref.extractall(tmpdirname)
                except zipfile.BadZipFile:
                    form.add_error('file', '無効なZIPファイルです。')
                    return render(request, 'file_viewer/upload.html', {'form': form})
                
                # .gitignore のパスを探す
                gitignore_path = os.path.join(tmpdirname, '.gitignore')
                ignored_dirs = parse_gitignore(gitignore_path)

                # ディレクトリツリーを構築
                tree = build_directory_tree(tmpdirname, ignored_dirs)

                # ディレクトリツリーをコンテキストに渡して表示
                # ZIPファイルのルートディレクトリ名を取得
                root_dirs = [name for name in zip_ref.namelist() if name.endswith('/')]
                root_dir_name = os.path.basename(root_dirs[0].rstrip('/')) if root_dirs else 'Root'
                return render(request, 'file_viewer/directory_tree.html', {'tree': tree, 'root_dir': root_dir_name})
    else:
        form = UploadFileForm()
    return render(request, 'file_viewer/upload.html', {'form': form})