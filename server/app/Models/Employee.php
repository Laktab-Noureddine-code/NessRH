<?php

namespace App\Models;

use App\Enums\ContractType;
use App\Enums\EmployeeStatus;
use App\Enums\Gender;
use App\Enums\MaritalStatus;
use App\Enums\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    /** @use HasFactory<\Database\Factories\EmployeeFactory> */
    use HasFactory;

    protected $fillable = [
        // Informations personnelles
        'matricule_employe',
        'nom_complet',
        'cin',
        'date_expiration_cin',
        'date_naissance',
        'lieu_naissance',
        'sexe',
        'nationalite',
        'situation_familiale',
        'nombre_enfants',
        'adresse',
        'ville',
        'code_postal',
        'telephone_mobile',
        'email_personnel',
        'nom_contact_urgence',
        'telephone_contact_urgence',
        
        // Informations professionnelles
        'entreprise_id',
        'departement_id',
        'date_embauche',
        'poste',
        'manager_id',
        'statut',
        'date_fin_contrat',
        'motif_depart',
        
        // Informations de contrat
        'type_contrat',
        'date_debut_contrat',
        'periode_essai_mois',
        'date_fin_essai',
        'regime_travail',
        'heures_par_semaine',
        
        // Rémunération
        'salaire_brut_mensuel',
        'mode_paiement',
        'rib_bancaire',
        'nom_banque',
        
        // CNSS
        'numero_cnss',
        'date_inscription_cnss',
        'statut_cnss',
        
        // Métadonnées
        'photo_url'
    ];
     protected $casts = [
        'date_expiration_cin' => 'date',
        'date_naissance' => 'date',
        'date_embauche' => 'date',
        'date_fin_contrat' => 'date',
        'date_debut_contrat' => 'date',
        'date_fin_essai' => 'date',
        'date_inscription_cnss' => 'date',
        'salaire_brut_mensuel' => 'decimal:2',
        'nombre_enfants' => 'integer',
        'heures_par_semaine' => 'integer',
        'periode_essai_mois' => 'integer',
        
        // Enums
        'statut' => EmployeeStatus::class,
        'type_contrat' => ContractType::class,
        'mode_paiement' => PaymentMethod::class,
        'sexe' => Gender::class,
        'situation_familiale' => MaritalStatus::class,
    ];


    public function company(){
        return $this->belongsTo(Company::class ,'company_id');
    }

    public function department(){
        return $this->belongsTo(Department::class ,'department_id');
    }

    // employee belongs to manager
    public function manager(){
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    // manager has many subordinates (employee)
    public function subordinates(){
        return $this->hasMany(Employee::class, 'manager_id');
    }

    public function jobPosition(){
        return $this->belongsTo(JobPosition::class, 'job_position_id');
    }

    public function contracts(){
        return $this->hasMany(Contract::class);
    }
}
