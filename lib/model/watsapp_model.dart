class WhatsAppModel {
  int? code;
  bool? status;
  String? message;
  WhatsAppData? data;

  WhatsAppModel({this.code, this.status, this.message, this.data});

  WhatsAppModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new WhatsAppData.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class WhatsAppData {
  String? sId;
  String? teacherWhatsapp;
  String? studentWhatsapp;
  String? createdBy;
  String? updatedBy;
  String? createdAt;
  String? updatedAt;
  int? iV;
  String? id;

  WhatsAppData(
      {this.sId,
      this.teacherWhatsapp,
      this.studentWhatsapp,
      this.createdBy,
      this.updatedBy,
      this.createdAt,
      this.updatedAt,
      this.iV,
      this.id});

  WhatsAppData.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    teacherWhatsapp = json['teacherWhatsapp'];
    studentWhatsapp = json['studentWhatsapp'];
    createdBy = json['createdBy'];
    updatedBy = json['updatedBy'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    iV = json['__v'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['teacherWhatsapp'] = this.teacherWhatsapp;
    data['studentWhatsapp'] = this.studentWhatsapp;
    data['createdBy'] = this.createdBy;
    data['updatedBy'] = this.updatedBy;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['__v'] = this.iV;
    data['id'] = this.id;
    return data;
  }
}
