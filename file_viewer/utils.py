import os
import zipfile

def parse_gitignore(gitignore_path):
    """
    .gitignore ファイルを解析し、無視するディレクトリのリストを返します。
    さらに、'node_modules' と '__pycache__' を常に無視するように追加します。
    """
    # 常に無視するディレクトリ
    always_ignored = {'venv', 'node_modules', '__pycache__', 'vendor', 'rest_framework', 'staticfiles', '.git', 'logs', 'img', '.DS_Store', '__MACOSX', 'htmlcov', 'screenshots'}
    ignored_dirs = set(always_ignored)
    
    if not os.path.exists(gitignore_path):
        return ignored_dirs

    with open(gitignore_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            # ディレクトリのみを対象とする
            if line.endswith('/'):
                dir_name = line.rstrip('/')
                ignored_dirs.add(dir_name)
            else:
                # フォルダ名だけを追加
                ignored_dirs.add(line)
    return ignored_dirs

def build_directory_tree(root_dir, ignored_dirs):
    """
    指定されたルートディレクトリのディレクトリツリーを構築します。
    .gitignore で無視されているディレクトリや 'venv', 'node_modules', '__pycache__' はその名前のみを表示し、中身は表示しません。
    """
    tree = {}

    for root, dirs, files in os.walk(root_dir):
        # 相対パスを取得
        rel_path = os.path.relpath(root, root_dir)
        if rel_path == '.':
            rel_path = ''
        parts = rel_path.split(os.sep) if rel_path else []
        current = tree
        for part in parts:
            current = current.setdefault(part, {})
        
        # フォルダの処理
        dirs_to_remove = []
        for d in dirs:
            if d in ignored_dirs:
                current[d] = {}
                dirs_to_remove.append(d)
        for d in dirs_to_remove:
            dirs.remove(d)  # 再帰を防ぐ

        # ファイルの処理
        for f in files:
            if f == '.gitignore':
                continue  # .gitignore 自身は表示しない
            current[f] = None

    return tree