import os
from flask import Flask, render_template, request, send_file
import logging
import pdfkit
import json
from datetime import datetime
import tempfile

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "financial-calculator-secret-key"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/export-pdf', methods=['POST'])
def export_pdf():
    try:
        data = request.json
        data['timestamp'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Format numbers in the projections data
        projections = []
        for i, label in enumerate(data['projections']['labels']):
            projections.append({
                'label': label,
                'balance': "{:,.0f}".format(data['projections']['balances'][i]),
                'cumulativeWithdrawals': "{:,.0f}".format(data['projections']['withdrawals'][i]),
                'initialInvestment': "{:,.0f}".format(data['projections']['compoundBreakdown']['initialInvestment'][i]),
                'returns': "{:,.0f}".format(data['projections']['compoundBreakdown']['returns'][i]),
                'withdrawals': "{:,.0f}".format(abs(data['projections']['compoundBreakdown']['withdrawals'][i]))
            })
        
        data['projections'] = projections
        
        # Generate HTML from template
        html = render_template('pdf_template.html', **data)
        
        # Create PDF
        pdf_file = tempfile.NamedTemporaryFile(suffix='.pdf')
        pdfkit.from_string(html, pdf_file.name)
        
        return send_file(
            pdf_file.name,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='financial_projection.pdf'
        )
    
    except Exception as e:
        logging.error(f"PDF generation error: {str(e)}")
        return {"error": "Failed to generate PDF"}, 500

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('index.html'), 500
