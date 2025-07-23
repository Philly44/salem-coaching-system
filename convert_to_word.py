#!/usr/bin/env python3
"""
Convert Markdown report to Word document
This script creates a properly formatted Word document from the privacy compliance report
"""

import re
from pathlib import Path

# Since we don't have python-docx, we'll create a simple HTML that Word can open
def markdown_to_html(markdown_text):
    """Convert markdown to HTML that Word can understand"""
    html = """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Calibri, Arial, sans-serif; line-height: 1.6; color: #333; }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; border-bottom: 2px solid #95a5a6; padding-bottom: 5px; margin-top: 30px; }
        h3 { color: #34495e; margin-top: 20px; }
        h4 { color: #7f8c8d; }
        code { background-color: #f4f4f4; padding: 2px 4px; font-family: Consolas, monospace; }
        pre { background-color: #f4f4f4; padding: 10px; overflow-x: auto; border-left: 4px solid #3498db; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th { background-color: #3498db; color: white; padding: 8px; text-align: left; }
        td { border: 1px solid #ddd; padding: 8px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        ul, ol { margin-left: 20px; }
        li { margin: 5px 0; }
        strong { color: #2c3e50; }
        .toc { background-color: #ecf0f1; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .summary-box { background-color: #e8f4f8; padding: 15px; border-left: 5px solid #3498db; margin: 20px 0; }
        .critical { color: #e74c3c; font-weight: bold; }
        .warning { color: #f39c12; font-weight: bold; }
        .success { color: #27ae60; font-weight: bold; }
    </style>
</head>
<body>
"""
    
    # Convert headers
    markdown_text = re.sub(r'^#### (.+)$', r'<h4>\1</h4>', markdown_text, flags=re.MULTILINE)
    markdown_text = re.sub(r'^### (.+)$', r'<h3>\1</h3>', markdown_text, flags=re.MULTILINE)
    markdown_text = re.sub(r'^## (.+)$', r'<h2>\1</h2>', markdown_text, flags=re.MULTILINE)
    markdown_text = re.sub(r'^# (.+)$', r'<h1>\1</h1>', markdown_text, flags=re.MULTILINE)
    
    # Convert bold
    markdown_text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', markdown_text)
    
    # Convert inline code
    markdown_text = re.sub(r'`([^`]+)`', r'<code>\1</code>', markdown_text)
    
    # Convert code blocks
    markdown_text = re.sub(r'```typescript\n(.*?)\n```', r'<pre><code>\1</code></pre>', markdown_text, flags=re.DOTALL)
    markdown_text = re.sub(r'```yaml\n(.*?)\n```', r'<pre><code>\1</code></pre>', markdown_text, flags=re.DOTALL)
    markdown_text = re.sub(r'```\n(.*?)\n```', r'<pre><code>\1</code></pre>', markdown_text, flags=re.DOTALL)
    
    # Convert lists
    lines = markdown_text.split('\n')
    in_list = False
    new_lines = []
    
    for line in lines:
        if line.strip().startswith('- '):
            if not in_list:
                new_lines.append('<ul>')
                in_list = True
            new_lines.append(f'<li>{line.strip()[2:]}</li>')
        else:
            if in_list and not line.strip().startswith('- '):
                new_lines.append('</ul>')
                in_list = False
            new_lines.append(line)
    
    if in_list:
        new_lines.append('</ul>')
    
    markdown_text = '\n'.join(new_lines)
    
    # Convert numbered lists
    markdown_text = re.sub(r'^\d+\. (.+)$', r'<li>\1</li>', markdown_text, flags=re.MULTILINE)
    
    # Handle special status indicators
    markdown_text = markdown_text.replace('✅', '<span class="success">✓</span>')
    markdown_text = markdown_text.replace('⚠️', '<span class="warning">⚠</span>')
    markdown_text = markdown_text.replace('❌', '<span class="critical">✗</span>')
    
    # Convert tables
    table_pattern = r'\|(.+)\|\n\|[-\s|]+\|\n((?:\|.+\|\n?)+)'
    
    def convert_table(match):
        headers = [h.strip() for h in match.group(1).split('|') if h.strip()]
        rows = match.group(2).strip().split('\n')
        
        table_html = '<table>\n<tr>'
        for header in headers:
            table_html += f'<th>{header}</th>'
        table_html += '</tr>\n'
        
        for row in rows:
            cells = [c.strip() for c in row.split('|') if c.strip()]
            if cells:
                table_html += '<tr>'
                for cell in cells:
                    table_html += f'<td>{cell}</td>'
                table_html += '</tr>\n'
        
        table_html += '</table>'
        return table_html
    
    markdown_text = re.sub(table_pattern, convert_table, markdown_text, flags=re.MULTILINE)
    
    # Convert line breaks to paragraphs
    paragraphs = markdown_text.split('\n\n')
    markdown_text = '</p>\n<p>'.join(p for p in paragraphs if p.strip())
    markdown_text = f'<p>{markdown_text}</p>'
    
    # Clean up empty paragraphs
    markdown_text = re.sub(r'<p>\s*</p>', '', markdown_text)
    markdown_text = re.sub(r'<p>(<h[1-6]>)', r'\1', markdown_text)
    markdown_text = re.sub(r'(</h[1-6]>)</p>', r'\1', markdown_text)
    markdown_text = re.sub(r'<p>(<pre>)', r'\1', markdown_text)
    markdown_text = re.sub(r'(</pre>)</p>', r'\1', markdown_text)
    markdown_text = re.sub(r'<p>(<ul>)', r'\1', markdown_text)
    markdown_text = re.sub(r'(</ul>)</p>', r'\1', markdown_text)
    markdown_text = re.sub(r'<p>(<table>)', r'\1', markdown_text)
    markdown_text = re.sub(r'(</table>)</p>', r'\1', markdown_text)
    
    html += markdown_text
    html += """
</body>
</html>"""
    
    return html

def main():
    # Read the markdown file
    input_file = Path('docs/PRIVACY_COMPLIANCE_REPORT.md')
    output_file = Path('docs/PRIVACY_COMPLIANCE_REPORT.html')
    
    if not input_file.exists():
        print(f"Error: {input_file} not found!")
        return
    
    with open(input_file, 'r', encoding='utf-8') as f:
        markdown_content = f.read()
    
    # Convert to HTML
    html_content = markdown_to_html(markdown_content)
    
    # Save as HTML (Word can open this)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✓ Created {output_file}")
    print(f"✓ You can open this file in Microsoft Word")
    print(f"✓ Once open in Word, save it as a .docx file")
    
    # Also create a simpler .doc file that Word can definitely open
    doc_file = Path('docs/PRIVACY_COMPLIANCE_REPORT.doc')
    with open(doc_file, 'w', encoding='utf-8') as f:
        # Write a simple RTF-like format that Word understands
        f.write('{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 ')
        
        # Convert some basic formatting
        content = markdown_content
        content = content.replace('\n# ', '\\par\\b\\fs32 ')
        content = content.replace('\n## ', '\\par\\b\\fs28 ')
        content = content.replace('\n### ', '\\par\\b\\fs24 ')
        content = content.replace('\n', '\\par ')
        content = content.replace('**', '\\b ')
        content = content.replace('✅', '[OK] ')
        content = content.replace('⚠️', '[WARNING] ')
        content = content.replace('❌', '[CRITICAL] ')
        
        f.write(content)
        f.write('}')
    
    print(f"✓ Also created simplified {doc_file}")

if __name__ == '__main__':
    main()