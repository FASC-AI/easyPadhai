class InstituteModel {
  int? code;
  bool? status;
  String? message;
  InsData? data;

  InstituteModel({this.code, this.status, this.message, this.data});

  InstituteModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new InsData.fromJson(json['data']) : null;
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

class InsData {
  String? codee;
  String? status;
  String? instituteType;
  String? institutesName;
  String? sId;
  String? createdAt;
  String? updatedAt;
  int? code;
  int? iV;
  String? id;

  InsData(
      {this.codee,
      this.status,
      this.instituteType,
      this.institutesName,
      this.sId,
      this.createdAt,
      this.updatedAt,
      this.code,
      this.iV,
      this.id});

  InsData.fromJson(Map<String, dynamic> json) {
    codee = json['codee'];
    status = json['status'];
    instituteType = json['instituteType'];
    institutesName = json['institutesName'];
    sId = json['_id'];
    createdAt = json['createdAt'];
    updatedAt = json['updatedAt'];
    code = json['code'];
    iV = json['__v'];
    id = json['id'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['codee'] = this.codee;
    data['status'] = this.status;
    data['instituteType'] = this.instituteType;
    data['institutesName'] = this.institutesName;
    data['_id'] = this.sId;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    data['code'] = this.code;
    data['__v'] = this.iV;
    data['id'] = this.id;
    return data;
  }
}
