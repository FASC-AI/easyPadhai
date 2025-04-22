class InstitutionListModel {
  int? code;
  bool? status;
  String? message;
  InstitutionData? data;

  InstitutionListModel({this.code, this.status, this.message, this.data});

  InstitutionListModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? InstitutionData.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['code'] = code;
    data['status'] = status;
    data['message'] = message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class InstitutionData {
  List<InstitutesList>? institutes;
  int? count;

  InstitutionData({this.institutes, this.count});

  InstitutionData.fromJson(Map<String, dynamic> json) {
    if (json['institutes'] != null) {
      institutes = <InstitutesList>[];
      json['institutes'].forEach((v) {
        institutes!.add(InstitutesList.fromJson(v));
      });
    }
    count = json['count'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (institutes != null) {
      data['institutes'] = institutes!.map((v) => v.toJson()).toList();
    }
    data['count'] = count;
    return data;
  }
}

class InstitutesList {
  Address? address;
  String? sId;
  String? codee;
  String? description;
  String? status;
  bool? isActive;
  String? institutesName;
  String? phone;
  String? createdAt;
  String? updatedAt;
  int? code;
  int? iV;
  bool? isVerified;

  InstitutesList(
      {this.address,
      this.sId,
      this.codee,
      this.description,
      this.status,
      this.isActive,
      this.institutesName,
      this.phone,
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV,
      this.isVerified});

  InstitutesList.fromJson(Map<String, dynamic> json) {
    address =
        json['address'] != null ? Address.fromJson(json['address']) : null;
    sId = json['_id'];
    codee = json['codee'];
    description = json['description'];
    status = json['status'];
    isActive = json['isActive'];
    institutesName = json['institutesName'];
    phone = json['phone'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    code = json['code'];
    iV = json['__v'];
    isVerified = json['isVerified'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (address != null) {
      data['address'] = address!.toJson();
    }
    data['_id'] = sId;
    data['codee'] = codee;
    data['description'] = description;
    data['status'] = status;
    data['isActive'] = isActive;
    data['institutesName'] = institutesName;
    data['phone'] = phone;
    data['createdAt'] = createdAt;
    data['updatedAt'] = updatedAt;
    data['code'] = code;
    data['__v'] = iV;
    data['isVerified'] = isVerified;
    return data;
  }
}

class Address {
  String? pinCode;
  String? address1;
  String? address2;
  String? country;

  Address({this.pinCode, this.address1, this.address2, this.country});

  Address.fromJson(Map<String, dynamic> json) {
    pinCode = json['pinCode'];
    address1 = json['address1'];
    address2 = json['address2'];
    country = json['country'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['pinCode'] = pinCode;
    data['address1'] = address1;
    data['address2'] = address2;
    data['country'] = country;
    return data;
  }
}
