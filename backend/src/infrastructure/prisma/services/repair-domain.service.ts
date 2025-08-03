import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {
  AppointmentTimeSlot,
  TechnicianSpecialty,
} from "../../../domain/repair/repair.entity";
import { RepairDomainServicePort } from "../../../domain/repair/repair.port";

@Injectable()
export class PrismaRepairDomainService implements RepairDomainServicePort {
  constructor(private prisma: PrismaService) {}

  async calculateRepairCost(
    deviceType: string,
    issueType: string,
  ): Promise<{ min: number; max: number }> {
    // Table des coûts de réparation basée sur le type d'appareil et le problème
    const costMatrix = {
      smartphone: {
        screen: { min: 15000, max: 50000 },
        battery: { min: 10000, max: 25000 },
        charging: { min: 8000, max: 20000 },
        water_damage: { min: 25000, max: 75000 },
        camera: { min: 15000, max: 45000 },
        software: { min: 5000, max: 20000 },
        default: { min: 15000, max: 50000 },
      },
      laptop: {
        screen: { min: 35000, max: 120000 },
        keyboard: { min: 15000, max: 45000 },
        battery: { min: 20000, max: 60000 },
        charging: { min: 15000, max: 40000 },
        storage: { min: 25000, max: 100000 },
        motherboard: { min: 70000, max: 200000 },
        default: { min: 25000, max: 100000 },
      },
      tablet: {
        screen: { min: 25000, max: 85000 },
        battery: { min: 15000, max: 40000 },
        charging: { min: 10000, max: 30000 },
        default: { min: 20000, max: 75000 },
      },
      desktop: {
        power_supply: { min: 15000, max: 45000 },
        motherboard: { min: 50000, max: 150000 },
        storage: { min: 20000, max: 80000 },
        ram: { min: 10000, max: 40000 },
        cpu: { min: 40000, max: 180000 },
        gpu: { min: 60000, max: 250000 },
        default: { min: 30000, max: 120000 },
      },
      tv: {
        screen: { min: 50000, max: 250000 },
        power: { min: 20000, max: 60000 },
        connectivity: { min: 15000, max: 50000 },
        default: { min: 35000, max: 200000 },
      },
      default: { min: 15000, max: 50000 },
    };

    // Normalisation du type d'appareil et du problème
    const normalizedDeviceType = deviceType.toLowerCase();
    const normalizedIssueType = issueType.toLowerCase().replace(/\s+/g, '_');

    // Récupération des coûts en fonction du type d'appareil et du problème
    const deviceCosts = costMatrix[normalizedDeviceType] || costMatrix.default;
    const issueCosts = deviceCosts[normalizedIssueType] || deviceCosts.default;

    return issueCosts;
  }

  async findBestTechnician(
    specialty: TechnicianSpecialty,
    location: { region: string; city: string },
  ) {
    // Récupérer tous les techniciens avec cette spécialité dans cette région/ville
    const users = await this.prisma.user.findMany({
      where: {
        role: "agent",
        // Idéalement, on filtrerait par spécialité et emplacement, mais pour l'instant
        // nous ne pouvons pas faire cela directement avec le modèle actuel
      },
      include: {
        technicianAvailability: true,
      },
    });

    if (users.length === 0) {
      return null;
    }

    // Nous allons attribuer un score à chaque technicien en fonction de différents critères
    const techniciansWithScore = users.map(user => {
      // Disponibilité - un technicien est considéré disponible s'il a des plages horaires disponibles
      const isAvailable = user.technicianAvailability && 
                          user.technicianAvailability.length > 0;
      
      // Base du score - commence à 0
      let score = 0;
      
      // Augmenter le score si le technicien est disponible
      if (isAvailable) {
        score += 50;
      }
      
      // Récupérer les spécialités du technicien (si elles existent)
      // Dans un système réel, cela viendrait d'une table spécifique
      // Nous n'avons pas de champ technicianNotes dans le modèle User
      // Nous utilisons une valeur par défaut pour l'instant
      const hasSpecialty = Math.random() > 0.5; // Simulation pour le MVP
      // Augmenter le score si le technicien a la spécialité requise
      // Dans une implémentation finale, nous utiliserions une table dédiée aux spécialités
      if (hasSpecialty) {
        score += 30;
      }
      
      // Vérifier si le technicien est dans la région/ville demandée
      // Dans un système réel, cela viendrait des tables address, region, city
      let matchesLocation = false;
      
      // Si le technicien a des adresses, vérifier si l'une d'elles correspond à l'emplacement demandé
      // Dans une implémentation réelle, nous vérifierions les adresses de l'utilisateur
      // Pour l'instant, nous supposons que le technicien est dans la bonne région/ville
      // avec une certaine probabilité
      const isInRegion = Math.random() > 0.3; // 70% de chance d'être dans la bonne région
      if (isInRegion) {
        score += 10;
        
        const isInCity = Math.random() > 0.5; // 50% de chance d'être dans la bonne ville
        if (isInCity) {
          score += 10;
          matchesLocation = true;
        }
      }
      
      // Note par défaut pour le technicien (entre 3 et 5)
      const rating = Math.floor(Math.random() * 3) + 3;
      
      // Augmenter le score en fonction de la note (0-5 étoiles)
      score += rating * 2;
      
      return {
        user,
        score,
        isAvailable,
        matchesLocation,
      };
    });
    
    // Trier les techniciens par score décroissant
    techniciansWithScore.sort((a, b) => b.score - a.score);
    
    // Retourner le meilleur technicien s'il existe
    if (techniciansWithScore.length > 0) {
      const bestTechnician = techniciansWithScore[0];
      
      // Convertir en objet Technician
      return {
        id: bestTechnician.user.id,
        name: bestTechnician.user.fullName,
        email: bestTechnician.user.email,
        phone: bestTechnician.user.phone237,
        specialties: [specialty], // Nous supposons que le technicien a la spécialité requise
        rating: Math.floor(Math.random() * 3) + 3, // Note entre 3 et 5
        isAvailable: bestTechnician.isAvailable,
        location: {
          region: location.region,
          city: location.city,
          commune: "Unknown", // Nous n'avons pas cette information pour l'instant
        },
        createdAt: bestTechnician.user.createdAt,
        updatedAt: bestTechnician.user.updatedAt,
      };
    }
    
    return null;
  }

  async getAvailableTimeSlots(
    technicianId: string,
    date: Date,
  ): Promise<AppointmentTimeSlot[]> {
    // Tous les créneaux horaires possibles
    const allTimeSlots = [
      AppointmentTimeSlot.MORNING_8_10,
      AppointmentTimeSlot.MORNING_10_12,
      AppointmentTimeSlot.AFTERNOON_14_16,
      AppointmentTimeSlot.AFTERNOON_16_18,
    ];

    // Formater la date pour la recherche (sans l'heure)
    const formattedDate = new Date(date.toISOString().split("T")[0]);

    // Vérifier les disponibilités du technicien pour cette date
    const availability = await this.prisma.technicianAvailability.findUnique({
      where: {
        technicianId_availableDate: {
          technicianId,
          availableDate: formattedDate,
        },
      },
    });

    if (!availability) {
      // Si aucune entrée n'existe, le technicien est libre pour tous les créneaux
      return allTimeSlots;
    }

    // Récupérer les rendez-vous existants pour ce technicien à cette date
    // Nous utilisons les informations stockées dans les objets RepairJob
    const repairJobs = await this.prisma.repairJob.findMany({
      where: {
        technicianNotes: {
          path: ["appointment", "technicianId"],
          equals: technicianId,
        },
        preferredDate: {
          gte: new Date(formattedDate.setHours(0, 0, 0, 0)),
          lt: new Date(formattedDate.setHours(23, 59, 59, 999)),
        },
      },
    });

    // Extraire les créneaux horaires déjà réservés
    const bookedTimeSlots = [];
    for (const job of repairJobs) {
      const technicianNotes = job.technicianNotes as any;
      if (technicianNotes && technicianNotes.appointment) {
        const appointment = technicianNotes.appointment;
        // Vérifier si l'appointment est pour la date spécifiée
        const appointmentDate = new Date(appointment.scheduledDate);
        if (appointmentDate.toDateString() === formattedDate.toDateString()) {
          bookedTimeSlots.push(appointment.timeSlot);
        }
      }
    }

    // Retourner uniquement les créneaux disponibles
    return allTimeSlots.filter(
      (timeSlot) => !bookedTimeSlots.includes(timeSlot)
    );
  }

  async sendAppointmentNotification(
    appointmentId: string,
    type: "confirmation" | "reminder" | "cancellation",
  ): Promise<void> {
    // Rechercher l'appointment dans les RepairJobs
    const repairJobs = await this.prisma.repairJob.findMany({
      where: {
        technicianNotes: {
          path: ["appointment", "id"],
          equals: appointmentId,
        },
      },
    });

    if (repairJobs.length === 0) {
      throw new Error(`Appointment with id ${appointmentId} not found`);
    }

    const repairJob = repairJobs[0];
    const technicianNotes = repairJob.technicianNotes as any;
    
    if (!technicianNotes || !technicianNotes.appointment) {
      throw new Error(`Appointment data not found for id ${appointmentId}`);
    }

    const appointment = technicianNotes.appointment;
    
    // Récupérer les informations du client et du technicien
    const user = await this.prisma.user.findUnique({
      where: { id: appointment.userId },
    });
    
    const technician = await this.prisma.user.findUnique({
      where: { id: appointment.technicianId },
    });

    if (!user || !technician) {
      throw new Error("User or technician not found");
    }

    // Dans un système réel, nous enverrions un email ou un SMS
    // Pour l'instant, nous allons juste logger les informations
    
    // Construire le message en fonction du type de notification
    let message = "";
    switch (type) {
      case "confirmation":
        message = `Confirmation du rendez-vous de réparation le ${appointment.scheduledDate.toLocaleDateString()} à ${appointment.timeSlot} avec ${technician.fullName}`;
        break;
      case "reminder":
        message = `Rappel: Votre rendez-vous de réparation est prévu le ${appointment.scheduledDate.toLocaleDateString()} à ${appointment.timeSlot} avec ${technician.fullName}`;
        break;
      case "cancellation":
        message = `Annulation du rendez-vous de réparation prévu le ${appointment.scheduledDate.toLocaleDateString()} à ${appointment.timeSlot}`;
        break;
    }

    // Journaliser l'envoi de la notification
    console.log(`Notification envoyée à ${user.fullName} (${user.email}): ${message}`);
    
    // Dans un système réel, nous utiliserions un service d'email ou de SMS
    // et nous enregistrerions la notification dans une table dédiée
  }
}