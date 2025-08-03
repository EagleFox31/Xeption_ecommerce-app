import { Injectable } from '@nestjs/common';
import { Order } from '../../domain/cartorder/order.entity';
import PDFDocument from 'pdfkit';
import * as fs from 'fs-extra';
import { join } from 'path';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Service professionnel pour la génération de factures
 * Utilise PDFKit pour créer des documents PDF de haute qualité
 */
@Injectable()
export class InvoiceService {
  // Informations de l'entreprise
  private readonly companyInfo = {
    name: 'Xeption Network',
    address: 'Boutique 2063, Mfoundi Mall, Yaoundé, Cameroun',
    email: 'support@xeptionetwork.shop',
    phone: '+237 697 686 684',
    website: 'https://xeptionetwork.shop',
    registrationNumber: 'XPT-2025-CMR',
  };

  // Chemin vers le logo (à créer)
  private readonly logoPath = join(process.cwd(), 'public', 'assets', 'logo.png');
  
  /**
   * Génère des données de facture détaillées à partir d'une commande
   * Cette structure de données peut être utilisée pour les réponses API ou comme base pour la génération PDF
   */
  generateInvoiceData(orderData: any): any {
    // Formatage de la date en français
    const formattedDate = format(new Date(orderData.invoiceDate), 'dd MMMM yyyy', { locale: fr });
    
    return {
      ...orderData,
      companyInfo: this.companyInfo,
      formattedDate,
      paymentInstructions: this.getPaymentInstructions(orderData.paymentDetails.method),
    };
  }

  /**
   * Obtient les instructions de paiement spécifiques en fonction du mode de paiement
   */
  private getPaymentInstructions(paymentMethod: string): string {
    switch (paymentMethod) {
      case 'om':
        return 'Paiement via Orange Money: Envoyez au 697 686 684. Utilisez votre numéro de commande comme référence.';
      case 'momo':
        return 'Paiement via MTN Mobile Money: Envoyez au 697 686 684. Utilisez votre numéro de commande comme référence.';
      case 'card':
        return 'Votre paiement par carte a été traité. Merci pour votre confiance.';
      case 'cash':
        return 'Veuillez préparer le montant exact pour la livraison. Notre agent de livraison vous fournira un reçu.';
      default:
        return 'Veuillez contacter notre service client pour les instructions de paiement.';
    }
  }

  /**
   * Génère un document PDF professionnel pour la facture
   */
  async generatePdf(invoiceData: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Créer un nouveau document PDF
        const doc = new PDFDocument({ 
          size: 'A4', 
          margin: 50,
          info: {
            Title: `Facture ${invoiceData.invoiceNumber}`,
            Author: 'Xeption Network',
            Subject: 'Facture client',
            Keywords: 'facture, commande, paiement',
            Creator: 'Système de facturation Xeption',
            Producer: 'PDFKit'
          }
        });

        // Flux pour capturer le PDF en mémoire
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // --- En-tête de la facture ---
        this.generateHeader(doc);
        
        // --- Informations de la facture ---
        this.generateInvoiceInfo(doc, invoiceData);
        
        // --- Informations du client ---
        this.generateCustomerInfo(doc, invoiceData.customer);
        
        // --- Tableau des articles ---
        this.generateItemsTable(doc, invoiceData.items);
        
        // --- Totaux ---
        this.generateTotals(doc, invoiceData.totals);
        
        // --- Pied de page ---
        this.generateFooter(doc, invoiceData);

        // Finaliser le document
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Génère l'en-tête de la facture avec le logo et les informations de l'entreprise
   */
  private generateHeader(doc: typeof PDFDocument): void {
    try {
      // Logo (s'il existe)
      if (fs.existsSync(this.logoPath)) {
        doc.image(this.logoPath, 50, 45, { width: 100 });
      } else {
        // Si le logo n'existe pas, utiliser un texte stylisé
        doc.fontSize(20).font('Helvetica-Bold').text('XEPTION NETWORK', 50, 45);
      }
      
      // Informations de l'entreprise
      doc.fontSize(10).font('Helvetica')
        .text(this.companyInfo.address, 50, 70)
        .text(`Tél: ${this.companyInfo.phone}`, 50, 85)
        .text(`Email: ${this.companyInfo.email}`, 50, 100)
        .text(`Site web: ${this.companyInfo.website}`, 50, 115)
        .text(`RCCM: ${this.companyInfo.registrationNumber}`, 50, 130)
        .moveDown();
    } catch (error) {
      console.error('Erreur lors de la génération de l\'en-tête:', error);
      // Continuer avec le reste du document même si l'en-tête échoue
    }
  }

  /**
   * Génère les informations de la facture (numéro et date)
   */
  private generateInvoiceInfo(doc: typeof PDFDocument, invoice: any): void {
    const titleY = 160;
    
    // Titre de la facture
    doc.fontSize(16).font('Helvetica-Bold')
      .text('FACTURE', 50, titleY, { align: 'left' });
    
    // Informations de base de la facture
    doc.fontSize(10).font('Helvetica')
      .text(`Facture N°: ${invoice.invoiceNumber}`, 50, titleY + 30)
      .text(`Date: ${invoice.formattedDate}`, 50, titleY + 45)
      .moveDown();
    
    // Ligne de séparation
    doc.strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, titleY + 70)
      .lineTo(550, titleY + 70)
      .stroke();
  }

  /**
   * Génère les informations du client
   */
  private generateCustomerInfo(doc: typeof PDFDocument, customer: any): void {
    const customerY = 240;
    
    doc.fontSize(12).font('Helvetica-Bold')
      .text('INFORMATIONS CLIENT', 50, customerY);
    
    doc.fontSize(10).font('Helvetica')
      .text(`Nom: ${customer.name}`, 50, customerY + 20)
      .text(`Email: ${customer.email}`, 50, customerY + 35)
      .text(`Téléphone: ${customer.phone}`, 50, customerY + 50)
      .moveDown();
  }

  /**
   * Génère le tableau des articles commandés
   */
  private generateItemsTable(doc: typeof PDFDocument, items: any[]): void {
    const tableTop = 340;
    const tableHeaders = ['Article', 'Quantité', 'Prix unitaire', 'Total'];
    const tableColumnWidths = [250, 70, 100, 80];
    
    // En-tête du tableau
    doc.fontSize(10).font('Helvetica-Bold');
    let xPos = 50;
    
    tableHeaders.forEach((header, i) => {
      doc.text(header, xPos, tableTop);
      xPos += tableColumnWidths[i];
    });
    
    // Ligne sous les en-têtes
    doc.strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();
    
    // Contenu du tableau
    doc.font('Helvetica');
    let yPos = tableTop + 25;
    
    items.forEach(item => {
      // Vérifier si on a besoin d'une nouvelle page
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
        
        // Répéter les en-têtes sur la nouvelle page
        doc.fontSize(10).font('Helvetica-Bold');
        xPos = 50;
        tableHeaders.forEach((header, i) => {
          doc.text(header, xPos, yPos);
          xPos += tableColumnWidths[i];
        });
        
        doc.strokeColor('#cccccc')
          .lineWidth(1)
          .moveTo(50, yPos + 15)
          .lineTo(550, yPos + 15)
          .stroke();
        
        yPos += 25;
        doc.font('Helvetica');
      }
      
      xPos = 50;
      doc.text(item.name, xPos, yPos);
      xPos += tableColumnWidths[0];
      
      doc.text(item.quantity.toString(), xPos, yPos);
      xPos += tableColumnWidths[1];
      
      doc.text(`${this.formatCurrency(item.unitPrice)} XAF`, xPos, yPos);
      xPos += tableColumnWidths[2];
      
      doc.text(`${this.formatCurrency(item.totalPrice)} XAF`, xPos, yPos);
      
      yPos += 20;
    });
    
    // Ligne de séparation après les articles
    doc.strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, yPos)
      .lineTo(550, yPos)
      .stroke();
    
    // Mettre à jour la position Y pour les totaux
    this.currentY = yPos + 10;
  }

  private currentY: number = 0;

  /**
   * Génère la section des totaux
   */
  private generateTotals(doc: typeof PDFDocument, totals: any): void {
    const totalsX = 400;
    let yPos = this.currentY + 10;
    
    // Sous-total
    doc.font('Helvetica').text('Sous-total:', totalsX, yPos);
    doc.text(`${this.formatCurrency(totals.subtotal)} XAF`, 550, yPos, { align: 'right' });
    yPos += 15;
    
    // Livraison
    doc.text('Frais de livraison:', totalsX, yPos);
    doc.text(`${this.formatCurrency(totals.shipping)} XAF`, 550, yPos, { align: 'right' });
    yPos += 15;
    
    // TVA
    doc.text('TVA:', totalsX, yPos);
    doc.text(`${this.formatCurrency(totals.tax)} XAF`, 550, yPos, { align: 'right' });
    yPos += 15;
    
    // Remise (si applicable)
    if (totals.discount > 0) {
      doc.text('Remise:', totalsX, yPos);
      doc.text(`-${this.formatCurrency(totals.discount)} XAF`, 550, yPos, { align: 'right' });
      yPos += 15;
    }
    
    // Ligne avant le total
    doc.strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(totalsX, yPos)
      .lineTo(550, yPos)
      .stroke();
    yPos += 10;
    
    // Total
    doc.fontSize(12).font('Helvetica-Bold').text('TOTAL:', totalsX, yPos);
    doc.text(`${this.formatCurrency(totals.total)} XAF`, 550, yPos, { align: 'right' });
    
    this.currentY = yPos + 30;
  }

  /**
   * Génère le pied de page avec les instructions de paiement
   */
  private generateFooter(doc: typeof PDFDocument, invoice: any): void {
    let yPos = this.currentY + 10;
    
    // Méthode de paiement
    doc.fontSize(11).font('Helvetica-Bold')
      .text('Méthode de paiement:', 50, yPos);
    
    doc.fontSize(10).font('Helvetica')
      .text(this.getPaymentMethodName(invoice.paymentDetails.method), 180, yPos);
    yPos += 15;
    
    // Statut du paiement
    doc.fontSize(11).font('Helvetica-Bold')
      .text('Statut:', 50, yPos);
    
    doc.fontSize(10).font('Helvetica')
      .text(this.getPaymentStatusName(invoice.paymentDetails.status), 180, yPos);
    yPos += 25;
    
    // Instructions de paiement
    doc.fontSize(10).font('Helvetica-Bold')
      .text('Instructions de paiement:', 50, yPos);
    yPos += 15;
    
    doc.fontSize(10).font('Helvetica')
      .text(invoice.paymentInstructions, 50, yPos, { width: 500 });
    yPos += 40;
    
    // Note de remerciement
    doc.fontSize(10).font('Helvetica-Bold')
      .text('Merci pour votre confiance!', 50, yPos, { align: 'center' });
    
    // Pied de page légal
    const pageHeight = doc.page.height;
    doc.fontSize(8).font('Helvetica')
      .text('Ce document est une facture électronique. Conservez-la comme preuve d\'achat.', 50, pageHeight - 50, 
        { align: 'center', width: 500 });
  }

  /**
   * Traduit le code de méthode de paiement en nom lisible en français
   */
  private getPaymentMethodName(method: string): string {
    const methods = {
      'om': 'Orange Money',
      'momo': 'MTN Mobile Money',
      'card': 'Carte bancaire',
      'cash': 'Paiement à la livraison',
      'paypal': 'PayPal',
    };
    
    return methods[method] || 'Méthode inconnue';
  }

  /**
   * Traduit le code de statut de paiement en nom lisible en français
   */
  private getPaymentStatusName(status: string): string {
    const statuses = {
      'pending': 'En attente',
      'paid': 'Payé',
      'failed': 'Échoué',
      'refunded': 'Remboursé',
      'partially_refunded': 'Partiellement remboursé',
    };
    
    return statuses[status] || 'Statut inconnu';
  }

  /**
   * Formate les montants avec séparateurs de milliers
   */
  private formatCurrency(amount: number): string {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
}