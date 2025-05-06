class SimpleModel {
  int? code;
  bool? status;
  String? message;
  Data1? data;

  SimpleModel({this.code, this.status, this.message, this.data});

  SimpleModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new Data1.fromJson(json['data']) : null;
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

class Data1 {
  String? id;
  bool? approve;

  Data1({this.id, this.approve});

  Data1.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    approve = json['approve'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['id'] = this.id;
    data['approve'] = this.approve;
    return data;
  }
}
